"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { COLLECTION_IDS } from "@/data/collections";
import { PALETTE_IDS } from "@/data/palettes";
import { APP_SETTINGS_TAG } from "@/lib/app-settings";
import { requireAdmin, type AdminContext } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admin-emails";
import { fetchLessonFromYouTube } from "@/lib/captions";
import { VIDEOS_TAG } from "@/lib/catalog";
import { toLessonRow } from "@/lib/lesson-row";
import { lessonTag } from "@/lib/lessons";
import { parseVideoId } from "@/lib/youtube-url";

export type AdminResult = { ok: true } | { ok: false; error: string };

const userId = z.string().uuid();
const videoId = z.string().regex(/^[A-Za-z0-9_-]{11}$/);
const BAN_FOREVER = "876000h";

// Validates input, checks the caller is an admin, runs the action and records it in admin_audit.
async function withAdmin<T extends z.ZodType>(
  action: string,
  schema: T,
  input: unknown,
  run: (ctx: AdminContext, data: z.infer<T>) => Promise<AdminResult>,
): Promise<AdminResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: "Admins only" };
  const result = await run(ctx, parsed.data);
  if (result.ok) {
    const details = parsed.data as Record<string, unknown>;
    const target = (details.userId ?? details.videoId ?? details.url ?? null) as string | null;
    // Logging must never undo a change that already happened, so its error is ignored.
    await ctx.admin.from("admin_audit").insert({ admin_email: ctx.user.email, action, target, details });
  }
  return result;
}

// Admin accounts can't be banned or deleted from the panel, so nobody can lock the admins out.
async function assertNotAdmin(ctx: AdminContext, id: string): Promise<string | null> {
  const { data, error } = await ctx.admin.auth.admin.getUserById(id);
  if (error || !data.user) return "User not found";
  return isAdminEmail(data.user.email) ? "Admin accounts can't be changed here" : null;
}

export async function setUserBanned(input: { userId: string; isBanned: boolean }) {
  return withAdmin("user.ban", z.object({ userId, isBanned: z.boolean() }), input, async (ctx, { userId: id, isBanned }) => {
    const blocked = await assertNotAdmin(ctx, id);
    if (blocked) return { ok: false, error: blocked };
    const { error } = await ctx.admin.auth.admin.updateUserById(id, { ban_duration: isBanned ? BAN_FOREVER : "none" });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  });
}

export async function deleteUser(input: { userId: string }) {
  return withAdmin("user.delete", z.object({ userId }), input, async (ctx, { userId: id }) => {
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
  return withAdmin("user.word.delete", z.object({ userId, word: z.string().min(1).max(60) }), input, async (ctx, { userId: id, word }) => {
    const { error } = await ctx.admin.from("saved_words").delete().eq("user_id", id).eq("word", word);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  });
}

export async function deleteUserFavorite(input: { userId: string; videoId: string }) {
  return withAdmin("user.favorite.delete", z.object({ userId, videoId }), input, async (ctx, { userId: id, videoId: vid }) => {
    const { error } = await ctx.admin.from("favorites").delete().eq("user_id", id).eq("video_id", vid);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/users/${id}`);
    return { ok: true };
  });
}

export async function resetUserProgress(input: { userId: string }) {
  return withAdmin("user.progress.reset", z.object({ userId }), input, async (ctx, { userId: id }) => {
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
  return withAdmin("lesson.delete", z.object({ videoId }), input, async (ctx, { videoId: vid }) => {
    const { error } = await ctx.admin.from("lessons").delete().eq("video_id", vid);
    if (error) return { ok: false, error: error.message };
    updateTag(lessonTag(vid));
    revalidatePath("/admin/lessons");
    return { ok: true };
  });
}

// Only works where YouTube allows caption requests (a home connection, not most cloud hosts).
export async function refetchLesson(input: { videoId: string }) {
  return withAdmin("lesson.refetch", z.object({ videoId }), input, async (ctx, { videoId: vid }) => {
    const result = await fetchLessonFromYouTube(vid).catch((e: unknown) => ({ error: String(e) }));
    if ("error" in result && result.error !== undefined) return { ok: false, error: result.error };
    if (!("lesson" in result) || !result.lesson) return { ok: false, error: "No lesson returned" };
    const { error } = await ctx.admin
      .from("lessons")
      .upsert({ ...toLessonRow(result.lesson, result.source), updated_at: new Date().toISOString() });
    if (error) return { ok: false, error: error.message };
    updateTag(lessonTag(vid));
    revalidatePath("/admin/lessons");
    return { ok: true };
  });
}

// ---- Video catalog ----

const level = z.enum(["A1", "A2", "B1"]);
const topic = z.string().trim().min(1).max(60);
const collection = z.enum(COLLECTION_IDS);

function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const minutes = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${minutes}:${String(s).padStart(2, "0")}`;
}

const AddVideoSchema = z.object({ url: z.string().min(1).max(300), level, topic, collection });

// Adds a video and stores its transcript in one go. Needs YouTube to answer, so it may fail on cloud hosts.
export async function addVideo(input: z.input<typeof AddVideoSchema>) {
  return withAdmin("video.add", AddVideoSchema, input, async (ctx, data) => {
    const id = parseVideoId(data.url);
    if (!id) return { ok: false, error: "That isn't a valid YouTube link or video ID" };
    const { data: existing } = await ctx.admin.from("videos").select("video_id").eq("video_id", id).maybeSingle();
    if (existing) return { ok: false, error: "This video is already in the catalog" };

    const result = await fetchLessonFromYouTube(id).catch((e: unknown) => ({ error: String(e) }));
    if ("error" in result && result.error !== undefined) {
      return { ok: false, error: `YouTube: ${result.error}. If the server is blocked, add it from a local machine.` };
    }
    if (!("lesson" in result) || !result.lesson) return { ok: false, error: "No lesson returned" };

    const { data: last } = await ctx.admin
      .from("videos")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const [lessonSave, videoSave] = await Promise.all([
      ctx.admin
        .from("lessons")
        .upsert({ ...toLessonRow(result.lesson, result.source), updated_at: new Date().toISOString() }),
      ctx.admin.from("videos").insert({
        video_id: id,
        title: result.lesson.title.slice(0, 200),
        level: data.level,
        topic: data.topic,
        collection_id: data.collection,
        duration: formatDuration(result.lesson.durationSec),
        channel: result.lesson.author.slice(0, 100),
        sort_order: ((last as { sort_order: number } | null)?.sort_order ?? 0) + 1,
      }),
    ]);
    const error = lessonSave.error ?? videoSave.error;
    if (error) return { ok: false, error: error.message };
    updateTag(VIDEOS_TAG);
    revalidatePath("/admin/videos");
    return { ok: true };
  });
}

const UpdateVideoSchema = z.object({
  videoId,
  title: z.string().trim().min(1).max(200),
  level,
  topic,
  collection,
  duration: z.string().trim().max(10),
  channel: z.string().trim().max(100),
  isPublished: z.boolean(),
});

export async function updateVideo(input: z.input<typeof UpdateVideoSchema>) {
  return withAdmin("video.update", UpdateVideoSchema, input, async (ctx, data) => {
    const { error } = await ctx.admin
      .from("videos")
      .update({
        title: data.title,
        level: data.level,
        topic: data.topic,
        collection_id: data.collection,
        duration: data.duration,
        channel: data.channel,
        is_published: data.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("video_id", data.videoId);
    if (error) return { ok: false, error: error.message };
    updateTag(VIDEOS_TAG);
    revalidatePath("/admin/videos");
    return { ok: true };
  });
}

export async function setVideoPublished(input: { videoId: string; isPublished: boolean }) {
  return withAdmin("video.publish", z.object({ videoId, isPublished: z.boolean() }), input, async (ctx, data) => {
    const { error } = await ctx.admin
      .from("videos")
      .update({ is_published: data.isPublished, updated_at: new Date().toISOString() })
      .eq("video_id", data.videoId);
    if (error) return { ok: false, error: error.message };
    updateTag(VIDEOS_TAG);
    revalidatePath("/admin/videos");
    return { ok: true };
  });
}

// Removes the video from the catalog only; its transcript and learners' progress stay.
export async function deleteVideo(input: { videoId: string }) {
  return withAdmin("video.delete", z.object({ videoId }), input, async (ctx, data) => {
    const { error } = await ctx.admin.from("videos").delete().eq("video_id", data.videoId);
    if (error) return { ok: false, error: error.message };
    updateTag(VIDEOS_TAG);
    revalidatePath("/admin/videos");
    return { ok: true };
  });
}

export async function setPalette(input: { paletteId: string }) {
  return withAdmin("theme.palette", z.object({ paletteId: z.enum(PALETTE_IDS) }), input, async (ctx, { paletteId }) => {
    const { error } = await ctx.admin
      .from("app_settings")
      .upsert({ key: "palette", value: paletteId, updated_at: new Date().toISOString(), updated_by: ctx.user.email ?? null });
    if (error) return { ok: false, error: error.message };
    updateTag(APP_SETTINGS_TAG);
    return { ok: true };
  });
}
