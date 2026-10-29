"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { COLLECTION_IDS } from "@/data/collections";
import { COLLECTION_COOKIE } from "@/lib/collection";
import { COURSE_MODE_COOKIE } from "@/lib/course-mode";
import { schedule } from "@/lib/srs";
import { recordSignInEvent } from "@/lib/sign-in-log";
import { getLocalToday, getTimeZone } from "@/lib/study-day";
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

const CourseBlockSchema = z.object({
  courseId: z.string().min(1).max(40),
  day: z.number().int().min(1).max(60),
  blockId: z.string().min(1).max(40),
  isDone: z.boolean(),
});

export async function setCourseBlockDone(input: z.input<typeof CourseBlockSchema>): Promise<ActionResult> {
  const parsed = CourseBlockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const { courseId, day, blockId, isDone } = parsed.data;
  const { error } = isDone
    ? await ctx.supabase
        .from("course_progress")
        .upsert({ user_id: ctx.user.id, course_id: courseId, day, block_id: blockId })
    : await ctx.supabase.from("course_progress").delete().match({ course_id: courseId, day, block_id: blockId });
  if (error) return { ok: false, error: "failed" };

  if (isDone) await recordStudyDay(ctx);
  revalidatePath("/course");
  return { ok: true };
}

const VideoNoteSchema = z.object({ videoId, atSec: z.number().min(0).max(86400), text: z.string().trim().min(1).max(500) });

export async function addVideoNote(
  input: z.input<typeof VideoNoteSchema>,
): Promise<{ ok: true; id: string } | { ok: false; error: "signed-out" | "invalid" | "failed" }> {
  const parsed = VideoNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const { videoId: id, atSec, text } = parsed.data;
  const { data, error } = await ctx.supabase
    .from("video_notes")
    .insert({ user_id: ctx.user.id, video_id: id, at_sec: Math.round(atSec * 10) / 10, text })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "failed" };
  return { ok: true, id: (data as { id: string }).id };
}

export async function deleteVideoNote(input: { id: string }): Promise<ActionResult> {
  const parsed = z.object({ id: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };
  const { error } = await ctx.supabase.from("video_notes").delete().eq("id", parsed.data.id);
  return error ? { ok: false, error: "failed" } : { ok: true };
}

const PhraseListSchema = z.object({
  phrases: z.array(z.object({ text: z.string().min(1).max(60), meaning: z.string().max(200), example: z.string().max(300) })).max(30),
});

// Adds a course day's phrases to the learner's word list so they show up in Review.
export async function savePhrasesToReview(input: z.input<typeof PhraseListSchema>): Promise<ActionResult> {
  const parsed = PhraseListSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };

  const rows = parsed.data.phrases.map((p) => ({
    user_id: ctx.user.id,
    word: p.text,
    sentence: p.example,
    video_id: null,
    entry: {
      word: p.text,
      meanings: [{ partOfSpeech: "phrase", definition: p.meaning, example: p.example }],
      phrases: [],
      source: "free",
    },
  }));
  // ignoreDuplicates keeps the review schedule of phrases the learner already saved.
  const { error } = await ctx.supabase.from("saved_words").upsert(rows, { onConflict: "user_id,word", ignoreDuplicates: true });
  if (error) return { ok: false, error: "failed" };
  revalidatePath("/vocabulary");
  revalidatePath("/review");
  return { ok: true };
}

const StudyTimeSchema = z.object({ seconds: z.number().int().min(1).max(300) });

// Called every minute or so while the learner is actively studying.
export async function addStudyTime(input: z.input<typeof StudyTimeSchema>): Promise<ActionResult> {
  const parsed = StudyTimeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };
  const { error } = await ctx.supabase.rpc("add_study_seconds", { p_day: await getLocalToday(), p_seconds: parsed.data.seconds });
  return error ? { ok: false, error: "failed" } : { ok: true };
}

const SettingsSchema = z.object({
  dailyGoalMinutes: z.union([5, 10, 15, 20, 30, 45, 60].map((m) => z.literal(m))).optional(),
  remindersEnabled: z.boolean().optional(),
});

export async function updateSettings(input: z.input<typeof SettingsSchema>): Promise<ActionResult> {
  const parsed = SettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };
  const { dailyGoalMinutes, remindersEnabled } = parsed.data;
  const { error } = await ctx.supabase.from("user_settings").upsert({
    user_id: ctx.user.id,
    ...(dailyGoalMinutes !== undefined && { daily_goal_minutes: dailyGoalMinutes }),
    ...(remindersEnabled !== undefined && { reminders_enabled: remindersEnabled }),
    time_zone: await getTimeZone(),
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: "failed" };
  revalidatePath("/");
  revalidatePath("/account");
  return { ok: true };
}

const PushSubscriptionSchema = z.object({
  endpoint: z.url().max(1000).startsWith("https://"),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

export async function savePushSubscription(input: z.input<typeof PushSubscriptionSchema>): Promise<ActionResult> {
  const parsed = PushSubscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };
  const { endpoint, keys } = parsed.data;
  const { error } = await ctx.supabase
    .from("push_subscriptions")
    .upsert({ endpoint, user_id: ctx.user.id, p256dh: keys.p256dh, auth: keys.auth });
  if (error) return { ok: false, error: "failed" };
  return updateSettings({ remindersEnabled: true });
}

export async function deletePushSubscription(input: { endpoint: string }): Promise<ActionResult> {
  const parsed = z.object({ endpoint: z.string().max(1000) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "signed-out" };
  const { error } = await ctx.supabase.from("push_subscriptions").delete().eq("endpoint", parsed.data.endpoint);
  if (error) return { ok: false, error: "failed" };
  return updateSettings({ remindersEnabled: false });
}

const CollectionSchema = z.object({ collection: z.enum(COLLECTION_IDS) });

// Remembers the chosen collection on this device (cookie) and, when signed in, on the account.
export async function selectCollection(input: z.input<typeof CollectionSchema>): Promise<ActionResult> {
  const parsed = CollectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { collection } = parsed.data;
  const cookieStore = await cookies();
  cookieStore.set(COLLECTION_COOKIE, collection, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });

  const ctx = await getUserContext();
  if (ctx) {
    await ctx.supabase.from("user_settings").upsert({
      user_id: ctx.user.id,
      collection_id: collection,
      time_zone: await getTimeZone(),
      updated_at: new Date().toISOString(),
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

const CourseModeSchema = z.object({ mode: z.enum(["full", "gentle"]) });

// The A2 course plan (full or Gentle), remembered on this device and, when signed in, on the account.
export async function setCourseMode(input: z.input<typeof CourseModeSchema>): Promise<ActionResult> {
  const parsed = CourseModeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const cookieStore = await cookies();
  cookieStore.set(COURSE_MODE_COOKIE, parsed.data.mode, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });

  const ctx = await getUserContext();
  if (ctx) {
    // Fails quietly until migration 017 adds the column; the cookie still applies on this device.
    await ctx.supabase.from("user_settings").upsert({ user_id: ctx.user.id, course_mode: parsed.data.mode, updated_at: new Date().toISOString() });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

// Called just before the browser ends the session, so the sign-out shows in Admin -> Sign-ins.
export async function recordSignOut(): Promise<void> {
  const ctx = await getUserContext();
  if (!ctx) return;
  await recordSignInEvent({ event: "sign_out", userId: ctx.user.id, email: ctx.user.email, headers: await headers() });
}
