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
  intervalDays: number;
}

interface FavoriteRow {
  video_id: string;
  title: string;
  created_at: string;
}

interface SavedWordRow {
  id: string;
  word: string;
  sentence: string;
  video_id: string | null;
  entry: WordInfo | null;
  created_at: string;
  interval_days: number | null;
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

const SAVED_WORDS_BATCH = 1000;

// Every saved word, newest first. Supabase returns at most 1000 rows per request, so the list is read in
// keyset batches: each one continues after the (created_at, id) of the previous batch's last row.
export async function getSavedWords(): Promise<SavedWord[] | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const rows: SavedWordRow[] = [];
  for (;;) {
    const last = rows.at(-1);
    let request = ctx.supabase.from("saved_words").select("id, word, sentence, video_id, entry, created_at, interval_days");
    if (last) request = request.or(`created_at.lt.${last.created_at},and(created_at.eq.${last.created_at},id.lt.${last.id})`);
    const { data, error } = await request
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(SAVED_WORDS_BATCH);
    if (error) throw error;
    rows.push(...((data ?? []) as SavedWordRow[]));
    if (!data || data.length < SAVED_WORDS_BATCH) break;
  }
  return rows.map((r) => ({
    word: r.word,
    sentence: r.sentence,
    videoId: r.video_id,
    entry: r.entry,
    createdAt: r.created_at,
    intervalDays: r.interval_days ?? 0,
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
  todaySeconds: number;
  goalMinutes: number;
}

export interface UserSettings {
  dailyGoalMinutes: number;
  remindersEnabled: boolean;
}

export const DEFAULT_GOAL_MINUTES = 15;

export async function getUserSettings(): Promise<UserSettings | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase.from("user_settings").select("daily_goal_minutes, reminders_enabled").maybeSingle();
  const row = data as { daily_goal_minutes: number; reminders_enabled: boolean } | null;
  return { dailyGoalMinutes: row?.daily_goal_minutes ?? DEFAULT_GOAL_MINUTES, remindersEnabled: row?.reminders_enabled ?? false };
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
    .select("day, seconds")
    .order("day", { ascending: false })
    .limit(400);
  if (error) return null;

  const rows = (data ?? []) as { day: string; seconds: number }[];
  const days = new Set(rows.map((r) => r.day));
  const today = await getLocalToday();
  const settings = await getUserSettings();
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
  return {
    days: count,
    hasStudiedToday,
    longest: longestRun([...days]),
    week,
    todaySeconds: rows.find((r) => r.day === today)?.seconds ?? 0,
    goalMinutes: settings?.dailyGoalMinutes ?? DEFAULT_GOAL_MINUTES,
  };
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

export interface VideoNote {
  id: string;
  atSec: number;
  text: string;
}

// The learner's notes on a video, in video order. null when signed out (notes then stay on the device).
export async function getVideoNotes(videoId: string): Promise<VideoNote[] | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase
    .from("video_notes")
    .select("id, at_sec, text")
    .eq("video_id", videoId)
    .order("at_sec", { ascending: true });
  if (error) return [];
  return ((data ?? []) as { id: string; at_sec: number; text: string }[]).map((n) => ({ id: n.id, atSec: Number(n.at_sec), text: n.text }));
}

// Finished blocks per day for a course, e.g. { 1: ["listen-1", "phrases"] }. null when signed out.
export async function getCourseProgress(courseId: string): Promise<Record<number, string[]> | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase.from("course_progress").select("day, block_id").eq("course_id", courseId);
  if (error) return {};
  const byDay: Record<number, string[]> = {};
  for (const row of (data ?? []) as { day: number; block_id: string }[]) (byDay[row.day] ??= []).push(row.block_id);
  return byDay;
}

export interface StudyStats {
  totalMinutes: number;
  activeDays: number;
  lessonsCompleted: number;
  wordsSaved: number;
  wordsMastered: number;
  // Oldest first; the last 12 weeks ending this week (Sunday), one entry per day.
  calendar: { day: string; minutes: number; isFuture: boolean }[];
}

// A word counts as mastered once review spaces it three weeks apart.
export const MASTERED_INTERVAL_DAYS = 21;
const CALENDAR_WEEKS = 12;

export async function getStudyStats(): Promise<StudyStats | null> {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const [days, completed, saved, mastered] = await Promise.all([
    ctx.supabase.from("study_days").select("day, seconds").order("day", { ascending: false }).limit(1000),
    ctx.supabase.from("lesson_progress").select("video_id", { count: "exact", head: true }).not("completed_at", "is", null),
    ctx.supabase.from("saved_words").select("word", { count: "exact", head: true }),
    ctx.supabase.from("saved_words").select("word", { count: "exact", head: true }).gte("interval_days", MASTERED_INTERVAL_DAYS),
  ]);
  if (days.error) return null;

  const rows = (days.data ?? []) as { day: string; seconds: number }[];
  const secondsByDay = new Map(rows.map((r) => [r.day, r.seconds]));
  const today = await getLocalToday();
  const sundayOffset = 6 - ((new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7);
  const lastDay = addDays(today, sundayOffset);
  const calendar = Array.from({ length: CALENDAR_WEEKS * 7 }, (_, i) => {
    const day = addDays(lastDay, i - CALENDAR_WEEKS * 7 + 1);
    return { day, minutes: Math.floor((secondsByDay.get(day) ?? 0) / 60), isFuture: day > today };
  });

  return {
    totalMinutes: Math.floor(rows.reduce((sum, r) => sum + r.seconds, 0) / 60),
    activeDays: rows.length,
    lessonsCompleted: completed.count ?? 0,
    wordsSaved: saved.count ?? 0,
    wordsMastered: mastered.count ?? 0,
    calendar,
  };
}
