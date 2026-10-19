"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { schedule } from "@/lib/srs";
import { getLocalToday } from "@/lib/study-day";
import { getUserContext } from "@/lib/user-data";

type UserContext = NonNullable<Awaited<ReturnType<typeof getUserContext>>>;

export type ActionResult = { ok: true } | { ok: false; error: "signed-out" | "invalid" | "failed" };

const videoId = z.string().regex(/^[A-Za-z0-9_-]{11}$/);

const FavoriteSchema = z.object({ videoId, title: z.string().min(1).max(300), isFavorite: z.boolean() });

const SavedWordSchema = z.object({
  word: z.string().min(1).max(60),
  sentence: z.string().max(500),
  videoId: videoId.nullable(),
  entry: z.record(z.string(), z.unknown()).nullable(),
  isSaved: z.boolean(),
});

export async function setFavorite(input: z.input<typeof FavoriteSchema>): Promise<ActionResult> {
  const parsed = FavoriteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const { videoId: id, title, isFavorite } = parsed.data;
  const { error } = isFavorite
    ? await ctx.supabase.from("favorites").upsert({ user_id: ctx.user.id, video_id: id, title })
    : await ctx.supabase.from("favorites").delete().eq("video_id", id);
  if (error) return { ok: false, error: "failed" };

  revalidatePath("/favorites");
  return { ok: true };
}

export async function setSavedWord(input: z.input<typeof SavedWordSchema>): Promise<ActionResult> {
  const parsed = SavedWordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const { word, sentence, videoId: id, entry, isSaved } = parsed.data;
  const { error } = isSaved
    ? await ctx.supabase
        .from("saved_words")
        .upsert({ user_id: ctx.user.id, word, sentence, video_id: id, entry }, { onConflict: "user_id,word" })
    : await ctx.supabase.from("saved_words").delete().eq("word", word);
  if (error) return { ok: false, error: "failed" };

  revalidatePath("/vocabulary");
  return { ok: true };
}

// Marks today as a study day for the streak.
async function recordStudyDay(ctx: UserContext) {
  const day = await getLocalToday();
  const { data } = await ctx.supabase.from("study_days").select("activity").eq("day", day).maybeSingle();
  const activity = ((data as { activity: number } | null)?.activity ?? 0) + 1;
  await ctx.supabase.from("study_days").upsert({ user_id: ctx.user.id, day, activity });
}

const ProgressSchema = z
  .object({ videoId, sentenceIndex: z.number().int().min(0), sentenceCount: z.number().int().min(1).max(5000) })
  .refine((p) => p.sentenceIndex < p.sentenceCount);

export async function recordProgress(input: z.input<typeof ProgressSchema>): Promise<ActionResult> {
  const parsed = ProgressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const { videoId: id, sentenceIndex, sentenceCount } = parsed.data;
  const { data } = await ctx.supabase
    .from("lesson_progress")
    .select("max_sentence, completed_at")
    .eq("video_id", id)
    .maybeSingle();
  const existing = data as { max_sentence: number; completed_at: string | null } | null;
  const maxSentence = Math.max(existing?.max_sentence ?? 0, sentenceIndex);
  const isComplete = maxSentence >= sentenceCount - 1;

  const { error } = await ctx.supabase.from("lesson_progress").upsert({
    user_id: ctx.user.id,
    video_id: id,
    last_sentence: sentenceIndex,
    max_sentence: maxSentence,
    sentence_count: sentenceCount,
    completed_at: existing?.completed_at ?? (isComplete ? new Date().toISOString() : null),
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "failed" };

  await recordStudyDay(ctx);
  return { ok: true };
}

const GradeSchema = z.object({ word: z.string().min(1).max(60), grade: z.enum(["again", "hard", "good", "easy"]) });

export async function gradeWord(input: z.input<typeof GradeSchema>): Promise<ActionResult> {
  const parsed = GradeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const { word, grade } = parsed.data;
  const { data, error: readError } = await ctx.supabase
    .from("saved_words")
    .select("interval_days, ease, reps, lapses")
    .eq("word", word)
    .maybeSingle();
  if (readError || !data) return { ok: false, error: "failed" };

  // The schedule is recomputed here from the stored state, never taken from the client.
  const row = data as { interval_days: number; ease: number; reps: number; lapses: number };
  const now = new Date();
  const next = schedule(
    { intervalDays: row.interval_days, ease: row.ease, reps: row.reps, lapses: row.lapses },
    grade,
    now,
  );
  const { error } = await ctx.supabase
    .from("saved_words")
    .update({
      interval_days: next.intervalDays,
      ease: next.ease,
      reps: next.reps,
      lapses: next.lapses,
      due_at: next.dueAt.toISOString(),
      last_reviewed_at: now.toISOString(),
    })
    .eq("word", word);
  if (error) return { ok: false, error: "failed" };

  await recordStudyDay(ctx);
  revalidatePath("/review");
  return { ok: true };
}
