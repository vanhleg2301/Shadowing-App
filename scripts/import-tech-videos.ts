// Adds the newest videos from a few AI and programming channels to News > AI & Tech, with their transcripts.
// Run from a home connection (YouTube blocks most cloud IPs); needs migration 026:
//   npm run import:tech-videos              up to 12 new videos
//   npm run import:tech-videos -- --limit=5
import { fetchLessonFromYouTube } from "../src/lib/captions";
import { toLessonRow } from "../src/lib/lesson-row";
import { createAdminClient } from "../src/lib/supabase/admin";

// The level is a rough judgement of each channel's speed and vocabulary.
const CHANNELS = [
  { name: "IBM Technology", id: "UCKWaEZ-_VweaEx1j62do_vQ", level: "B2" },
  { name: "ByteByteGo", id: "UCZgt6AzoyjslHTC9dz0UoTw", level: "B2" },
  { name: "Computerphile", id: "UC9-y-6csu5WGm29I7JiwpnA", level: "C1" },
  { name: "Fireship", id: "UCsBjURrPoezykLs9EqgamOA", level: "C1" },
];
const DEFAULT_LIMIT = 12;
const MIN_DURATION_SEC = 120;
const MAX_DURATION_SEC = 1200;
// The same gentle pace and stopping rule as seed-lessons.ts.
const PAUSE_MS = 6000;
const MAX_RATE_LIMITED_IN_A_ROW = 3;

interface FeedVideo {
  videoId: string;
  publishedAt: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

async function readChannelFeed(channelId: string): Promise<FeedVideo[]> {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!response.ok) throw new Error(`Feed request failed: ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)].flatMap(([entry]) => {
    const videoId = entry.match(/<yt:videoId>([^<]+)</)?.[1];
    const publishedAt = entry.match(/<published>([^<]+)</)?.[1];
    return videoId && publishedAt && !entry.includes("/shorts/") ? [{ videoId, publishedAt }] : [];
  });
}

async function main() {
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing Supabase settings or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  const limit = Number(process.argv.find((a) => a.startsWith("--limit="))?.slice(8)) || DEFAULT_LIMIT;

  const { data: existing, error } = await admin.from("tech_videos").select("video_id");
  if (error) throw new Error(`Can't read tech_videos: ${error.message}`);
  const stored = new Set((existing as { video_id: string }[]).map((r) => r.video_id));

  const queues = await Promise.all(
    CHANNELS.map(async (channel) => {
      // One channel's feed being down must not stop the others.
      const videos = await readChannelFeed(channel.id).catch((e: unknown) => {
        console.log(`  no feed for ${channel.name}: ${String(e)}`);
        return [];
      });
      return videos.filter((v) => !stored.has(v.videoId)).map((video) => ({ channel, video }));
    }),
  );
  console.log(`${queues.flat().length} new videos in the feeds, ${stored.size} already stored`);

  let added = 0;
  let rateLimitedInARow = 0;
  // Takes one video from each channel in turn, so one busy channel doesn't fill the list.
  while (added < limit && rateLimitedInARow < MAX_RATE_LIMITED_IN_A_ROW && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (!next || added >= limit || rateLimitedInARow >= MAX_RATE_LIMITED_IN_A_ROW) continue;
      await sleep(PAUSE_MS);
      const result = await fetchLessonFromYouTube(next.video.videoId).catch((e: unknown) => ({ error: String(e) }));
      if (result.error !== undefined) {
        console.log(`  skipped ${next.video.videoId} (${next.channel.name}): ${result.error}`);
        rateLimitedInARow = result.error.includes("429") ? rateLimitedInARow + 1 : 0;
        continue;
      }
      rateLimitedInARow = 0;
      const { lesson, source } = result;
      if (lesson.durationSec < MIN_DURATION_SEC || lesson.durationSec > MAX_DURATION_SEC) {
        console.log(`  skipped ${lesson.title}: ${formatDuration(lesson.durationSec)} long`);
        continue;
      }
      const { error: lessonError } = await admin.from("lessons").upsert({ ...toLessonRow(lesson, source), updated_at: new Date().toISOString() });
      const { error: videoError } = lessonError
        ? { error: lessonError }
        : await admin.from("tech_videos").upsert({
            video_id: lesson.videoId,
            title: lesson.title,
            channel: next.channel.name,
            duration: formatDuration(lesson.durationSec),
            level: next.channel.level,
            published_at: next.video.publishedAt,
          });
      if (videoError) {
        console.log(`  failed ${lesson.title}: ${videoError.message}`);
        continue;
      }
      added++;
      console.log(`[${added}/${limit}] ${next.channel.name}: ${lesson.title} (${formatDuration(lesson.durationSec)}, ${source})`);
    }
  }
  if (rateLimitedInARow >= MAX_RATE_LIMITED_IN_A_ROW) console.log("YouTube is rate limiting. Stopping; try again in a few hours.");
  console.log(`\nAdded ${added} videos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
