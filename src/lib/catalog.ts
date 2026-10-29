import { cacheLife, cacheTag } from "next/cache";
import { BBC_VIDEOS, BOB_VIDEOS, DEFAULT_COLLECTION, EASY_STREET_VIDEOS, SUPER_EASY_VIDEOS, isCollectionId, type CollectionId } from "@/data/collections";
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
  category?: string | null;
  published_at?: string | null;
}

// Bundled fallback: every collection, used when the videos table is missing or empty.
const BUNDLED_VIDEOS: CuratedVideo[] = [
  ...CURATED_VIDEOS,
  ...BOB_VIDEOS.map((v) => ({ ...v, collection: "bob" as const, channel: "Learn English with Bob the Canadian" })),
  ...BBC_VIDEOS.map((v) => ({ ...v, collection: "bbc" as const, channel: "BBC Learning English" })),
  ...SUPER_EASY_VIDEOS.map((v) => ({ ...v, collection: "super-easy" as const, channel: "Easy English" })),
  ...EASY_STREET_VIDEOS.map((v) => ({ ...v, collection: "easy-street" as const, channel: "Easy English" })),
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
    ...(row.category ? { category: row.category, publishedAt: row.published_at ?? undefined } : {}),
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
    .select("video_id, title, level, topic, duration, channel, is_published, sort_order, collection_id, category, published_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return BUNDLED_VIDEOS;
  // The server can't fetch transcripts (YouTube blocks cloud IPs), so videos that scripts/seed-lessons.ts
  // hasn't stored yet open in listen-and-note mode instead.
  const { data: lessonRows, error: lessonsError } = await supabase.from("lessons").select("video_id");
  const stored = new Set(((lessonRows ?? []) as { video_id: string }[]).map((r) => r.video_id));
  return (data as VideoRow[]).map((row) => ({
    ...toCatalogVideo(row),
    ...(lessonsError || stored.has(row.video_id) ? {} : { hasTranscript: false }),
  }));
}

export async function getCatalogVideo(videoId: string): Promise<CuratedVideo | undefined> {
  return (await getCatalog()).find((v) => v.videoId === videoId);
}

// News lessons, newest first.
export async function getNewsVideos(): Promise<CuratedVideo[]> {
  const catalog = await getCatalog();
  return catalog
    .filter((v) => v.category && v.hasTranscript !== false)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function getCollectionVideos(collection: CollectionId): Promise<CuratedVideo[]> {
  const catalog = await getCatalog();
  return catalog.filter((v) => getVideoCollection(v) === collection);
}

export type CollectionCounts = Partial<Record<CollectionId, number>>;

export async function getCollectionCounts(): Promise<CollectionCounts> {
  const counts: CollectionCounts = {};
  for (const video of await getCatalog()) {
    const id = getVideoCollection(video);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
