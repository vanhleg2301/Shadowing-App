// The course has no last week: after the hand-picked week 1, each week takes the next videos of the collection,
// from the course's own level up, then the easier ones, two on the same topic per day. Every week is five video days, a day to hear the week's main
// videos again and a free listening day, and it goes on as long as the collection has videos with transcripts.
import type { CourseDay } from "./course-a2";
import { LEVELS, type CuratedVideo, type Level } from "./curated";

export const DAYS_PER_WEEK = 7;
export const STUDY_DAYS_PER_WEEK = 5;
// A last week shorter than this waits for more videos.
const MIN_STUDY_DAYS = 2;

export const weekOf = (day: number) => Math.ceil(day / DAYS_PER_WEEK);
export const dayInWeek = (day: number) => ((day - 1) % DAYS_PER_WEEK) + 1;

function restDays(week: number, mains: CourseDay["videos"]): CourseDay[] {
  const first = (week - 1) * DAYS_PER_WEEK;
  return [
    {
      day: first + STUDY_DAYS_PER_WEEK + 1,
      kind: "review",
      title: "Hear the week again",
      canDo: "I can follow this week's videos without the text.",
      videos: mains,
      phrases: [],
      speakingPrompts: [],
    },
    {
      day: first + DAYS_PER_WEEK,
      kind: "free",
      title: "Free listening",
      canDo: "I listen to English for fun, with nothing to study.",
      videos: [],
      phrases: [],
      speakingPrompts: [],
    },
  ];
}

// Week 1's five hand-picked days plus its rest days.
export function completeWeekOne(studyDays: CourseDay[], mains: CourseDay["videos"]): CourseDay[] {
  return [...studyDays, ...restDays(1, mains)];
}

// Later weeks from the collection's videos that week 1 doesn't use.
export function buildLaterWeeks(videos: CuratedVideo[], usedIds: ReadonlySet<string>, startLevel: Level): CourseDay[] {
  // A2 course: A2, then B1, then A1 last; B1 course: B1, A2, A1; Gentle starts at A1.
  const start = LEVELS.indexOf(startLevel);
  const levelRank = (video: CuratedVideo) => {
    const index = LEVELS.indexOf(video.level);
    return index >= start ? index - start : LEVELS.length + start - index;
  };
  // Catalog order breaks ties, so new videos go to the end of their level.
  const pool = videos
    .map((video, order) => ({ video, order }))
    .filter(({ video }) => video.hasTranscript !== false && !video.category && !usedIds.has(video.videoId))
    .sort((a, b) => levelRank(a.video) - levelRank(b.video) || a.order - b.order)
    .map(({ video }) => video);

  const pairs: [CuratedVideo, CuratedVideo | undefined][] = [];
  const taken = new Set<string>();
  for (const main of pool) {
    if (taken.has(main.videoId)) continue;
    taken.add(main.videoId);
    const second =
      pool.find((v) => !taken.has(v.videoId) && v.topic === main.topic && v.level === main.level) ??
      pool.find((v) => !taken.has(v.videoId) && v.topic === main.topic);
    if (second) taken.add(second.videoId);
    pairs.push([main, second]);
  }

  const days: CourseDay[] = [];
  for (let start = 0, week = 2; pairs.length - start >= MIN_STUDY_DAYS; start += STUDY_DAYS_PER_WEEK, week++) {
    const weekPairs = pairs.slice(start, start + STUDY_DAYS_PER_WEEK);
    const first = (week - 1) * DAYS_PER_WEEK;
    weekPairs.forEach(([main, second], i) => {
      days.push({
        day: first + i + 1,
        kind: "study",
        title: main.topic,
        canDo: `I can follow “${main.title}” without the text.`,
        videos: [main, ...(second ? [second] : [])].map((v) => ({ id: v.videoId, title: v.title })),
        phrases: [],
        speakingPrompts: [],
      });
    });
    // A short last week still ends with its rest days, right after its last video day.
    const rest = restDays(week, weekPairs.map(([main]) => ({ id: main.videoId, title: main.title })));
    rest.forEach((day, i) => days.push({ ...day, day: first + weekPairs.length + i + 1 }));
    if (weekPairs.length < STUDY_DAYS_PER_WEEK) break;
  }
  return days;
}

// Collections with fewer videos than one more week (or none with transcripts) borrow the course's main collection.
export const MIN_LATER_WEEK_VIDEOS = 2 * STUDY_DAYS_PER_WEEK;
