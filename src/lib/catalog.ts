import { cacheLife, cacheTag } from "next/cache";
import { BBC_VIDEOS, BOB_VIDEOS, DEFAULT_COLLECTION, isCollectionId, type CollectionId } from "@/data/collections";
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
  collection_id?: string;
}

// Bundled fallback: every collection, used when the videos table is missing or empty.
const BUNDLED_VIDEOS: CuratedVideo[] = [
  ...CURATED_VIDEOS,
  ...BOB_VIDEOS.map((v) => ({ ...v, collection: "bob" as const, channel: "Learn English with Bob the Canadian" })),
  ...BBC_VIDEOS.map((v) => ({ ...v, collection: "bbc" as const, channel: "BBC Learning English" })),
];

export function getVideoCollection(video: CuratedVideo): CollectionId {
  return video.collection ?? DEFAULT_COLLECTION;
}

export function toCatalogVideo(row: VideoRow): CuratedVideo {
  return {
    videoId: row.video_id,
    title: row.title,
    level: (LEVELS as readonly string[]).includes(row.level) ? (row.level as Level) : "B1",
    topic: row.topic,
    duration: row.duration,
    channel: row.channel || undefined,
    collection: isCollectionId(row.collection_id) ? row.collection_id : DEFAULT_COLLECTION,
  };
}

// Published videos from the database; falls back to the bundled list if the table is missing or empty.
export async function getCatalog(): Promise<CuratedVideo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(VIDEOS_TAG);

  const supabase = createPublicClient();
  if (!supabase) return BUNDLED_VIDEOS;
  const { data, error } = await supabase
    .from("videos")
    .select("video_id, title, level, topic, duration, channel, is_published, sort_order, collection_id")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return BUNDLED_VIDEOS;
  return (data as VideoRow[]).map(toCatalogVideo);
}

export async function getCollectionVideos(collection: CollectionId): Promise<CuratedVideo[]> {
  const catalog = await getCatalog();
  return catalog.filter((v) => getVideoCollection(v) === collection);
}
