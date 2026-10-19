import type { User } from "@supabase/supabase-js";
import { CURATED_VIDEOS } from "@/data/curated";
import { isAdminEmail } from "./admin-emails";
import type { VideoRow } from "./catalog";
import { createAdminClient } from "./supabase/admin";
import { getUserContext } from "./user-data";

// Returns the service-role client only for a signed-in admin with a verified email.
export async function requireAdmin() {
  const ctx = await getUserContext();
  if (!ctx || !ctx.user.email_confirmed_at || !isAdminEmail(ctx.user.email)) return null;
  const admin = createAdminClient();
  return admin ? { admin, user: ctx.user } : null;
}

export type AdminContext = NonNullable<Awaited<ReturnType<typeof requireAdmin>>>;

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  isBanned: boolean;
  isAdmin: boolean;
  savedWords: number;
  favorites: number;
  lessonsStarted: number;
}

const PER_PAGE = 1000;

export function summarizeUser(user: User, counts: { savedWords: number; favorites: number; lessonsStarted: number }) {
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata.full_name as string | undefined) ?? "",
    provider: (user.app_metadata.provider as string | undefined) ?? "",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    isBanned: Boolean(user.banned_until && new Date(user.banned_until) > new Date()),
    isAdmin: isAdminEmail(user.email),
    ...counts,
  } satisfies AdminUserSummary;
}

export const ADMIN_PAGE_SIZE = 25;
const MAX_USER_PAGES = 20;

export interface Paged<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}

export function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function parseQuery(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? "";
}

async function countByUser(ctx: AdminContext, table: "saved_words" | "favorites" | "lesson_progress", userIds: string[]) {
  const counts = new Map<string, number>();
  if (userIds.length === 0) return counts;
  const { data } = await ctx.admin.from(table).select("user_id").in("user_id", userIds);
  for (const row of (data ?? []) as { user_id: string }[]) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  return counts;
}

async function getAllUsers(ctx: AdminContext): Promise<User[]> {
  const users: User[] = [];
  for (let page = 1; page <= MAX_USER_PAGES; page++) {
    const { data, error } = await ctx.admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw error;
    users.push(...data.users);
    if (!data.nextPage) break;
  }
  return users;
}

// Supabase Auth can't search users, so filter and sort in memory (fine up to ~20k accounts), then page.
export async function listUsers(ctx: AdminContext, page: number, query: string): Promise<Paged<AdminUserSummary>> {
  const needle = query.toLowerCase();
  const matching = (await getAllUsers(ctx))
    .filter((u) => {
      if (!needle) return true;
      const name = (u.user_metadata.full_name as string | undefined) ?? "";
      return (u.email ?? "").toLowerCase().includes(needle) || name.toLowerCase().includes(needle);
    })
    .sort((a, b) => (b.last_sign_in_at ?? b.created_at).localeCompare(a.last_sign_in_at ?? a.created_at));

  const totalPages = Math.max(1, Math.ceil(matching.length / ADMIN_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageUsers = matching.slice((current - 1) * ADMIN_PAGE_SIZE, current * ADMIN_PAGE_SIZE);
  const ids = pageUsers.map((u) => u.id);
  const [words, favorites, progress] = await Promise.all([
    countByUser(ctx, "saved_words", ids),
    countByUser(ctx, "favorites", ids),
    countByUser(ctx, "lesson_progress", ids),
  ]);

  return {
    items: pageUsers.map((u) =>
      summarizeUser(u, {
        savedWords: words.get(u.id) ?? 0,
        favorites: favorites.get(u.id) ?? 0,
        lessonsStarted: progress.get(u.id) ?? 0,
      }),
    ),
    page: current,
    totalPages,
    total: matching.length,
  };
}

export async function getOverview(ctx: AdminContext) {
  const count = async (table: string) => {
    const { count: n } = await ctx.admin.from(table).select("*", { count: "exact", head: true });
    return n ?? 0;
  };
  const today = new Date().toISOString().slice(0, 10);
  const [users, lessons, savedWords, favorites, progress, activeToday, videos] = await Promise.all([
    ctx.admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    count("lessons"),
    count("saved_words"),
    count("favorites"),
    count("lesson_progress"),
    ctx.admin.from("study_days").select("*", { count: "exact", head: true }).gte("day", today),
    ctx.admin.from("videos").select("*", { count: "exact", head: true }).eq("is_published", true),
  ]);
  return {
    users: users.error ? 0 : users.data.total,
    lessons,
    savedWords,
    favorites,
    progress,
    activeToday: activeToday.count ?? 0,
    publishedVideos: videos.count ?? 0,
  };
}

// Whole catalog including hidden videos; falls back to the bundled list before migration 004 is run.
export async function getAdminVideos(ctx: AdminContext): Promise<VideoRow[]> {
  const { data, error } = await ctx.admin
    .from("videos")
    .select("video_id, title, level, topic, duration, channel, is_published, sort_order")
    .order("sort_order", { ascending: true });
  if (!error && data && data.length > 0) return data as VideoRow[];
  return CURATED_VIDEOS.map((v, i) => ({
    video_id: v.videoId,
    title: v.title,
    level: v.level,
    topic: v.topic,
    duration: v.duration,
    channel: v.channel ?? "",
    is_published: true,
    sort_order: i + 1,
  }));
}

const ANALYTICS_TIME_ZONE = "Asia/Ho_Chi_Minh";
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: ANALYTICS_TIME_ZONE });
const labelFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function lastDays(count: number): string[] {
  const today = new Date(`${dayFormatter.format(new Date())}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - (count - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function topCounts(values: string[], limit: number): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getAnalytics(ctx: AdminContext, days = 30) {
  const range = lastDays(days);
  const [users, study, progress, words, catalog] = await Promise.all([
    getAllUsers(ctx),
    ctx.admin.from("study_days").select("day").gte("day", range[0]),
    ctx.admin.from("lesson_progress").select("video_id"),
    ctx.admin.from("saved_words").select("word"),
    getAdminVideos(ctx),
  ]);

  const signupDays = users.map((u) => dayFormatter.format(new Date(u.created_at)));
  const activeDays = ((study.data ?? []) as { day: string }[]).map((r) => r.day);
  const series = (dayList: string[]) =>
    range.map((day) => ({
      label: labelFormatter.format(new Date(`${day}T00:00:00Z`)),
      value: dayList.filter((d) => d === day).length,
    }));
  const titleOf = (id: string) => catalog.find((v) => v.video_id === id)?.title ?? id;

  return {
    signups: series(signupDays),
    // study_days has one row per learner per day, so a row count is a distinct-learner count.
    activeLearners: series(activeDays),
    topVideos: topCounts(((progress.data ?? []) as { video_id: string }[]).map((r) => r.video_id), 8).map((t) => ({
      label: titleOf(t.key),
      value: t.count,
      href: `/watch/${t.key}`,
    })),
    topWords: topCounts(((words.data ?? []) as { word: string }[]).map((r) => r.word), 10).map((t) => ({
      label: t.key,
      value: t.count,
    })),
  };
}
