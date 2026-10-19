import { cacheLife } from "next/cache";
import { fetchLessonFromYouTube } from "./captions";
import type { Lesson, Sentence } from "./lesson";
import { toLessonRow } from "./lesson-row";
import { createAdminClient, createPublicClient } from "./supabase/admin";

export type LessonResult = { lesson: Lesson; error?: never } | { lesson?: never; error: string };

interface LessonRow {
  video_id: string;
  title: string;
  author: string;
  duration_sec: number;
  sentences: Sentence[];
  has_translation: boolean;
}

async function readStoredLesson(videoId: string): Promise<Lesson | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lessons")
    .select("video_id, title, author, duration_sec, sentences, has_translation")
    .eq("video_id", videoId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as LessonRow;
  return {
    videoId: row.video_id,
    title: row.title,
    author: row.author,
    durationSec: row.duration_sec,
    sentences: row.sentences,
    hasTranslation: row.has_translation,
  };
}

// Stored transcript first; otherwise fetch from YouTube (works from a home connection, usually not from
// cloud hosts) and keep a copy when the service key is available, so pasted links only hit YouTube once.
export async function getLesson(videoId: string): Promise<LessonResult> {
  "use cache";
  cacheLife("days");

  const stored = await readStoredLesson(videoId);
  if (stored) return { lesson: stored };

  const fetched = await fetchLessonFromYouTube(videoId);
  if (fetched.error !== undefined) return { error: fetched.error };

  const admin = createAdminClient();
  if (admin) await admin.from("lessons").upsert(toLessonRow(fetched.lesson, fetched.source));
  return { lesson: fetched.lesson };
}
