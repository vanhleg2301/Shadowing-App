// Which videos My plan suggests: short ones at the learner's level for the week, easier ones for "Listen more".
import { LEVELS, type CuratedVideo, type Level } from "@/data/curated";
import { getCourse } from "@/data/courses";
import { getSelectedCollection } from "./collection";
import { getCourseMode } from "./course-mode";
import { isValidVideoId } from "./youtube-url";

const MIN_WEEK_SEC = 150;
const MAX_WEEK_SEC = 420;
const MAX_EXTRA_SEC = 900;
const SUGGESTION_COUNT = 12;

function toSeconds(duration: string): number {
  return duration.split(":").reduce((total, part) => total * 60 + (Number(part) || 0), 0);
}

// A stable pseudo-random order that changes with the seed (the week or the day).
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

// The level of the course the learner picked; A2 before they pick one.
export async function getPlanLevel(): Promise<Level> {
  const collection = await getSelectedCollection().catch(() => null);
  if (!collection) return "A2";
  return getCourse(collection, await getCourseMode()).startLevel;
}

const isStudyable = (video: CuratedVideo) => isValidVideoId(video.videoId) && video.hasTranscript !== false && !video.category;

export function getWeekSuggestions(catalog: CuratedVideo[], level: Level, usedIds: ReadonlySet<string>, weekStart: string): CuratedVideo[] {
  const below = LEVELS[Math.max(0, LEVELS.indexOf(level) - 1)];
  const rank = (video: CuratedVideo) => (video.level === level ? 0 : video.level === below ? 1 : 2);
  return catalog
    .filter((video) => isStudyable(video) && !usedIds.has(video.videoId))
    .filter((video) => {
      const seconds = toSeconds(video.duration);
      return seconds >= MIN_WEEK_SEC && seconds <= MAX_WEEK_SEC;
    })
    .sort((a, b) => rank(a) - rank(b) || hash(a.videoId + weekStart) - hash(b.videoId + weekStart))
    .slice(0, SUGGESTION_COUNT);
}

// Easy videos to listen to straight through: a level below the learner's, or their own level at A1.
export function getListenMoreVideos(catalog: CuratedVideo[], level: Level, excludeId: string, day: string, count = 3): CuratedVideo[] {
  const easy = LEVELS[Math.max(0, LEVELS.indexOf(level) - 1)];
  return catalog
    .filter((video) => isStudyable(video) && video.videoId !== excludeId && video.level === easy && toSeconds(video.duration) <= MAX_EXTRA_SEC)
    .sort((a, b) => hash(a.videoId + day) - hash(b.videoId + day))
    .slice(0, count);
}
