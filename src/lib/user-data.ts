import type { WordInfo } from "./dictionary";
import { getLocalToday, previousDay } from "./study-day";
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

export interface LibraryUserState {
  favoriteIds: string[];
  // Percent of sentences reached, per video the learner has opened.
  progress: Record<string, number>;
  // Started but not finished, most recent first.
  continueIds: string[];
}

interface ProgressRow {
  video_id: string;
  last_sentence: number;
  max_sentence: number;
  sentence_count: number;
  completed_at: string | null;
}

export async function getLibraryUserState(): Promise<LibraryUserState> {
  const empty = { favoriteIds: [], progress: {}, continueIds: [] };
  const ctx = await getUserContext();
  if (!ctx) return empty;
  const [favorites, progress] = await Promise.all([
    ctx.supabase.from("favorites").select("video_id"),
    ctx.supabase
      .from("lesson_progress")
      .select("video_id, last_sentence, max_sentence, sentence_count, completed_at")
      .order("updated_at", { ascending: false }),
  ]);
  const rows = (progress.data ?? []) as ProgressRow[];
  return {
    favoriteIds: ((favorites.data ?? []) as { video_id: string }[]).map((r) => r.video_id),
    progress: Object.fromEntries(
      rows.map((r) => [
        r.video_id,
        r.completed_at ? 100 : Math.round(((r.max_sentence + 1) / Math.max(r.sentence_count, 1)) * 100),
      ]),
    ),
    continueIds: rows.filter((r) => !r.completed_at).map((r) => r.video_id),
  };
}

export interface Streak {
  days: number;
  hasStudiedToday: boolean;
  longest: number;
  // Monday to Sunday of the current local week.
  week: { day: string; label: string; studied: boolean; isToday: boolean; isFuture: boolean }[];
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function addDays(day: string, delta: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function longestRun(days: string[]): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && addDays(sorted[i - 1], 1) === sorted[i] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

// Consecutive study days ending today, or yesterday if the learner hasn't studied yet today.
export async function getStreak(): Promise<Streak | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase
    .from("study_days")
    .select("day")
    .order("day", { ascending: false })
    .limit(400);
  if (error) return null;

  const days = new Set(((data ?? []) as { day: string }[]).map((r) => r.day));
  const today = await getLocalToday();
  const hasStudiedToday = days.has(today);
  let cursor = hasStudiedToday ? today : previousDay(today);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = previousDay(cursor);
  }
  const mondayOffset = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const monday = addDays(today, -mondayOffset);
  const week = WEEKDAY_LABELS.map((label, i) => {
    const day = addDays(monday, i);
    return { day, label, studied: days.has(day), isToday: day === today, isFuture: day > today };
  });
  return { days: count, hasStudiedToday, longest: longestRun([...days]), week };
}

export interface ReviewCard {
  word: string;
  sentence: string;
  videoId: string | null;
  entry: WordInfo | null;
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
}

interface ReviewRow {
  word: string;
  sentence: string;
  video_id: string | null;
  entry: WordInfo | null;
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
}

export async function getDueWords(limit: number): Promise<{ cards: ReviewCard[]; dueCount: number } | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const now = new Date().toISOString();
  const { data, count, error } = await ctx.supabase
    .from("saved_words")
    .select("word, sentence, video_id, entry, interval_days, ease, reps, lapses", { count: "exact" })
    .lte("due_at", now)
    .order("due_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return {
    dueCount: count ?? 0,
    cards: ((data ?? []) as ReviewRow[]).map((r) => ({
      word: r.word,
      sentence: r.sentence,
      videoId: r.video_id,
      entry: r.entry,
      intervalDays: r.interval_days,
      ease: r.ease,
      reps: r.reps,
      lapses: r.lapses,
    })),
  };
}

export interface LessonUserState {
  isFavorite: boolean;
  savedWords: string[];
  lastSentence: number;
}

// What the lesson page needs to render hearts, "saved" badges and resume for the signed-in learner.
export async function getLessonUserState(videoId: string): Promise<LessonUserState> {
  const ctx = await getUserContext();
  if (!ctx) return { isFavorite: false, savedWords: [], lastSentence: 0 };
  const [favorite, words, progress] = await Promise.all([
    ctx.supabase.from("favorites").select("video_id").eq("video_id", videoId).maybeSingle(),
    ctx.supabase.from("saved_words").select("word"),
    ctx.supabase.from("lesson_progress").select("last_sentence").eq("video_id", videoId).maybeSingle(),
  ]);
  return {
    isFavorite: Boolean(favorite.data),
    savedWords: ((words.data ?? []) as { word: string }[]).map((w) => w.word),
    lastSentence: (progress.data as { last_sentence: number } | null)?.last_sentence ?? 0,
  };
}
