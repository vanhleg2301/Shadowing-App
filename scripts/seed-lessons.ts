// Stores the transcripts of every catalog video in Supabase (public.lessons). The catalog is the videos
// table when it exists, otherwise the bundled list in src/data/curated.ts.
// Run from a home connection (YouTube blocks most cloud IPs):
//   npm run seed:lessons            only videos not stored yet
//   npm run seed:lessons -- --force refetch everything
//   npm run seed:lessons -- --karaoke refetch stored lessons that have no word timings yet
import { COLLECTION_IDS, type CollectionId } from "../src/data/collections";
import { COURSE_DAYS, getDayVideos } from "../src/data/course-a2";
import { CURATED_VIDEOS } from "../src/data/curated";
import { fetchLessonFromYouTube, type YouTubeLessonResult } from "../src/lib/captions";
import { toLessonRow } from "../src/lib/lesson-row";
import { isHostedLesson } from "../src/lib/media";
import { createAdminClient } from "../src/lib/supabase/admin";

// YouTube answers 429 after a few hundred quick caption requests, so stay gentle.
const CONCURRENCY = 1;
const PAUSE_MS = 6000;
// Stop after this many 429s in a row: retrying only extends the block.
const MAX_RATE_LIMITED_IN_A_ROW = 3;
// YouTube only allows a few dozen fetches per run, so the 7-day course videos go first, BBC's first of all,
// then the rest of BBC, then everything else.
const PRIORITY_COLLECTION: CollectionId = "bbc";

function getCourseVideoIds(collection: CollectionId): Set<string> {
  return new Set(COURSE_DAYS.flatMap((day) => getDayVideos(day, collection).map((v) => v.id)));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const admin = createAdminClient();
  if (!admin) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const isKaraoke = process.argv.includes("--karaoke");
  const { data: existing, error } = await admin.from("lessons").select(isKaraoke ? "video_id, sentences" : "video_id");
  if (error) throw new Error(`Can't read lessons table: ${error.message}`);
  const rows = (existing ?? []) as unknown as { video_id: string; sentences?: { wordStarts?: number[] }[] }[];
  const hasTimings = (r: (typeof rows)[number]) => r.sentences?.some((s) => s.wordStarts && s.wordStarts.length > 0) ?? false;
  const stored = new Set(rows.filter((r) => !isKaraoke || hasTimings(r)).map((r) => r.video_id));
  const isForce = process.argv.includes("--force");
  const { data: videoRows, error: videosError } = await admin.from("videos").select("video_id, title, collection_id");
  const catalog =
    !videosError && videoRows && videoRows.length > 0
      ? (videoRows as { video_id: string; title: string; collection_id: string | null }[]).map((v) => ({
          videoId: v.video_id,
          title: v.title,
          collection: v.collection_id,
        }))
      : CURATED_VIDEOS;
  // Hosted-audio lessons come from scripts/voa/import_voa.py, not YouTube.
  const queue = catalog.filter((v) => !isHostedLesson(v.videoId) && (isForce || !stored.has(v.videoId)));
  const priorityCourse = getCourseVideoIds(PRIORITY_COLLECTION);
  const allCourses = new Set(COLLECTION_IDS.flatMap((c) => [...getCourseVideoIds(c)]));
  const getRank = (v: (typeof queue)[number]) =>
    priorityCourse.has(v.videoId) ? 0 : allCourses.has(v.videoId) ? 1 : v.collection === PRIORITY_COLLECTION ? 2 : 3;
  queue.sort((a, b) => getRank(a) - getRank(b));
  const total = queue.length;
  console.log(`${total} to fetch, ${stored.size} already stored`);

  const failures: string[] = [];
  let done = 0;
  let rateLimitedInARow = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let video = queue.shift(); video && rateLimitedInARow < MAX_RATE_LIMITED_IN_A_ROW; video = queue.shift()) {
        await sleep(PAUSE_MS);
        const result: YouTubeLessonResult = await fetchLessonFromYouTube(video.videoId).catch((e: unknown) => ({
          error: String(e),
        }));
        if (result.error !== undefined) {
          failures.push(`${video.videoId} ${video.title}: ${result.error}`);
          console.log(`  failed: ${video.title} - ${result.error}`);
          rateLimitedInARow = result.error.includes("429") ? rateLimitedInARow + 1 : 0;
          if (rateLimitedInARow === MAX_RATE_LIMITED_IN_A_ROW) {
            console.log(`YouTube is rate limiting (429 ${MAX_RATE_LIMITED_IN_A_ROW} times in a row). Stopping; try again in a few hours.`);
          }
          continue;
        }
        rateLimitedInARow = 0;
        const { error: upsertError } = await admin
          .from("lessons")
          .upsert({ ...toLessonRow(result.lesson, result.source), updated_at: new Date().toISOString() });
        if (upsertError) {
          failures.push(`${video.videoId} ${video.title}: ${upsertError.message}`);
          continue;
        }
        done++;
        console.log(`[${done}/${total}] ${video.title} - ${result.lesson.sentences.length} sentences (${result.source})`);
      }
    }),
  );

  console.log(`\nStored ${done}/${total}.`);
  if (failures.length > 0) {
    console.log(`Failed (${failures.length}):\n${failures.map((f) => `  ${f}`).join("\n")}`);
    process.exitCode = 1;
  }
}

main();
