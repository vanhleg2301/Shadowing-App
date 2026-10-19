"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserContext } from "@/lib/user-data";

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
