import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "./admin-emails";
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

async function countByUser(ctx: AdminContext, table: "saved_words" | "favorites" | "lesson_progress") {
  const { data } = await ctx.admin.from(table).select("user_id");
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { user_id: string }[]) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  return counts;
}

export async function listUsers(ctx: AdminContext): Promise<AdminUserSummary[]> {
  const [{ data, error }, words, favorites, progress] = await Promise.all([
    ctx.admin.auth.admin.listUsers({ page: 1, perPage: PER_PAGE }),
    countByUser(ctx, "saved_words"),
    countByUser(ctx, "favorites"),
    countByUser(ctx, "lesson_progress"),
  ]);
  if (error) throw error;
  return data.users
    .map((u) =>
      summarizeUser(u, {
        savedWords: words.get(u.id) ?? 0,
        favorites: favorites.get(u.id) ?? 0,
        lessonsStarted: progress.get(u.id) ?? 0,
      }),
    )
    .sort((a, b) => (b.lastSignInAt ?? b.createdAt).localeCompare(a.lastSignInAt ?? a.createdAt));
}

export async function getOverview(ctx: AdminContext) {
  const count = async (table: string) => {
    const { count: n } = await ctx.admin.from(table).select("*", { count: "exact", head: true });
    return n ?? 0;
  };
  const today = new Date().toISOString().slice(0, 10);
  const [users, lessons, savedWords, favorites, progress, activeToday] = await Promise.all([
    ctx.admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    count("lessons"),
    count("saved_words"),
    count("favorites"),
    count("lesson_progress"),
    ctx.admin.from("study_days").select("*", { count: "exact", head: true }).gte("day", today),
  ]);
  return {
    users: users.error ? 0 : users.data.total,
    lessons,
    savedWords,
    favorites,
    progress,
    activeToday: activeToday.count ?? 0,
  };
}
