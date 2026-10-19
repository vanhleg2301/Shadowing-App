import type { WordInfo } from "./dictionary";
import { createClient } from "./supabase/server";

export interface FavoriteVideo {
  videoId: string;
  title: string;
  createdAt: string;
}

export interface SavedWord {
  word: string;
  sentence: string;
  videoId: string | null;
  entry: WordInfo | null;
  createdAt: string;
}

interface FavoriteRow {
  video_id: string;
  title: string;
  created_at: string;
}

interface SavedWordRow {
  word: string;
  sentence: string;
  video_id: string | null;
  entry: WordInfo | null;
  created_at: string;
}

export async function getUserContext() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

// null means signed out (or sign-in not configured).
export async function getFavorites(): Promise<FavoriteVideo[] | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase
    .from("favorites")
    .select("video_id, title, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as FavoriteRow[]).map((r) => ({ videoId: r.video_id, title: r.title, createdAt: r.created_at }));
}

export async function getSavedWords(): Promise<SavedWord[] | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase
    .from("saved_words")
    .select("word, sentence, video_id, entry, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as SavedWordRow[]).map((r) => ({
    word: r.word,
    sentence: r.sentence,
    videoId: r.video_id,
    entry: r.entry,
    createdAt: r.created_at,
  }));
}

export async function getFavoriteIds(): Promise<string[]> {
  const ctx = await getUserContext();
  if (!ctx) return [];
  const { data } = await ctx.supabase.from("favorites").select("video_id");
  return ((data ?? []) as { video_id: string }[]).map((r) => r.video_id);
}

// What the lesson page needs to render hearts and "saved" badges for the signed-in learner.
export async function getLessonUserState(videoId: string): Promise<{ isFavorite: boolean; savedWords: string[] }> {
  const ctx = await getUserContext();
  if (!ctx) return { isFavorite: false, savedWords: [] };
  const [favorite, words] = await Promise.all([
    ctx.supabase.from("favorites").select("video_id").eq("video_id", videoId).maybeSingle(),
    ctx.supabase.from("saved_words").select("word"),
  ]);
  return {
    isFavorite: Boolean(favorite.data),
    savedWords: ((words.data ?? []) as { word: string }[]).map((w) => w.word),
  };
}
