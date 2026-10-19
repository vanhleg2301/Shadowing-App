"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, type AdminContext } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admin-emails";
import { fetchLessonFromYouTube } from "@/lib/captions";
import { toLessonRow } from "@/lib/lesson-row";

export type AdminResult = { ok: true } | { ok: false; error: string };

const userId = z.string().uuid();
const videoId = z.string().regex(/^[A-Za-z0-9_-]{11}$/);
const BAN_FOREVER = "876000h";

async function withAdmin<T extends z.ZodType>(
  schema: T,
  input: unknown,
  run: (ctx: AdminContext, data: z.infer<T>) => Promise<AdminResult>,
): Promise<AdminResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Admins only" };
  return run(ctx, parsed.data);
}

// Admin accounts can't be banned or deleted from the panel, so nobody can lock the admins out.
async function assertNotAdmin(ctx: AdminContext, id: string): Promise<string | null> {
  const { data, error } = await ctx.admin.auth.admin.getUserById(id);
  if (error || !data.user) return "User not found";
  return isAdminEmail(data.user.email) ? "Admin accounts can't be changed here" : null;
}

export async function setUserBanned(input: { userId: string; isBanned: boolean }) {
  return withAdmin(z.object({ userId, isBanned: z.boolean() }), input, async (ctx, { userId: id, isBanned }) => {
    const blocked = await assertNotAdmin(ctx, id);
    if (blocked) return { ok: false, error: blocked };
    const { error } = await ctx.admin.auth.admin.updateUserById(id, { ban_duration: isBanned ? BAN_FOREVER : "none" });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  });
}

export async function deleteUser(input: { userId: string }) {
  return withAdmin(z.object({ userId }), input, async (ctx, { userId: id }) => {
    const blocked = await assertNotAdmin(ctx, id);
    if (blocked) return { ok: false, error: blocked };
    // Favorites, saved words, progress and study days are removed by ON DELETE CASCADE.
    const { error } = await ctx.admin.auth.admin.deleteUser(id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  });
}

export async function deleteUserWord(input: { userId: string; word: string }) {
  return withAdmin(z.object({ userId, word: z.string().min(1).max(60) }), input, async (ctx, { userId: id, word }) => {
    const { error } = await ctx.admin.from("saved_words").delete().eq("user_id", id).eq("word", word);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  });
}

export async function deleteUserFavorite(input: { userId: string; videoId: string }) {
  return withAdmin(z.object({ userId, videoId }), input, async (ctx, { userId: id, videoId: vid }) => {
    const { error } = await ctx.admin.from("favorites").delete().eq("user_id", id).eq("video_id", vid);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  });
}

export async function resetUserProgress(input: { userId: string }) {
  return withAdmin(z.object({ userId }), input, async (ctx, { userId: id }) => {
    const [progress, days] = await Promise.all([
      ctx.admin.from("lesson_progress").delete().eq("user_id", id),
      ctx.admin.from("study_days").delete().eq("user_id", id),
    ]);
    const error = progress.error ?? days.error;
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  });
}

export async function deleteLesson(input: { videoId: string }) {
  return withAdmin(z.object({ videoId }), input, async (ctx, { videoId: vid }) => {
    const { error } = await ctx.admin.from("lessons").delete().eq("video_id", vid);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/lessons");
    return { ok: true };
  });
}

// Only works where YouTube allows caption requests (a home connection, not most cloud hosts).
export async function refetchLesson(input: { videoId: string }) {
  return withAdmin(z.object({ videoId }), input, async (ctx, { videoId: vid }) => {
    const result = await fetchLessonFromYouTube(vid).catch((e: unknown) => ({ error: String(e) }));
    if ("error" in result && result.error !== undefined) return { ok: false, error: result.error };
    if (!("lesson" in result) || !result.lesson) return { ok: false, error: "No lesson returned" };
    const { error } = await ctx.admin
      .from("lessons")
      .upsert({ ...toLessonRow(result.lesson, result.source), updated_at: new Date().toISOString() });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/lessons");
    return { ok: true };
  });
}
