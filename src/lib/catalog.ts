import { cacheLife, cacheTag } from "next/cache";
import { CURATED_VIDEOS, LEVELS, type CuratedVideo, type Level } from "@/data/curated";
import { createPublicClient } from "./supabase/admin";

export const VIDEOS_TAG = "videos";

export interface VideoRow {
  video_id: string;
  title: string;
  level: string;
  topic: string;
  duration: string;
  channel: string;
  is_published: boolean;
  sort_order: number;
}

export function toCatalogVideo(row: VideoRow): CuratedVideo {
  return {
    videoId: row.video_id,
    title: row.title,
    level: (LEVELS as readonly string[]).includes(row.level) ? (row.level as Level) : "B1",
    topic: row.topic,
    duration: row.duration,
    channel: row.channel || undefined,
  };
}

// Published videos from the database; falls back to the bundled list if the table is missing or empty.
export async function getCatalog(): Promise<CuratedVideo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(VIDEOS_TAG);

  const supabase = createPublicClient();
  if (!supabase) return CURATED_VIDEOS;
  const { data, error } = await supabase
    .from("videos")
    .select("video_id, title, level, topic, duration, channel, is_published, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return CURATED_VIDEOS;
  return (data as VideoRow[]).map(toCatalogVideo);
}
