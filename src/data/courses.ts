// The course follows the collection's speed: slow and medium collections get "Understand A2 English", natural-speed
// ones get "Natural speed". Both go on week after week (src/lib/course-plan.ts).
import { getCollection, type CollectionId } from "./collections";
import type { Level } from "./curated";
import type { CourseMode } from "@/lib/course-mode";
import {
  COURSE_DAYS,
  GENTLE_PHRASE_COUNT,
  GENTLE_PLAYBACK_RATE,
  GENTLE_PROMPT_COUNT,
  getBlocks,
  getCourseId,
  getDayVideos,
  getGentleBlocks,
  type CourseBlock,
  type CourseDay,
} from "./course-a2";
import { COURSE_B1_DAYS, getB1Blocks, getB1DayVideos, getCourseB1Id } from "./course-b1";

export interface Course {
  level: "A2" | "B1";
  title: string;
  // For the compact course button on phones.
  shortTitle: string;
  description: string;
  tagline: string;
  // Week 1's five video days; the rest of the course is built from the collection.
  days: CourseDay[];
  // Later weeks come from this collection when the chosen one has too few videos with transcripts.
  fallbackCollection: CollectionId;
  // Later weeks start with videos of this level.
  startLevel: Level;
  getId: (collection: CollectionId) => string;
  getVideos: (day: CourseDay, collection: CollectionId) => CourseDay["videos"];
  getBlocks: (day: CourseDay, collection: CollectionId) => CourseBlock[];
  // Only the A2 course has a Gentle plan; these trim each day and slow the videos down.
  isGentle?: boolean;
  phraseCount?: number;
  promptCount?: number;
  playbackRate?: number;
}

// The steps every plan had before the days were built around their video (A2, Gentle and B1 alike). Days finished
// then still count as finished, so nobody is locked out of the next day.
const EARLIER_CORE_BLOCKS = ["listen-1", "phrases", "shadow-1", "speak", "quiz"];

// Stored with a day finished by "Mark day as done" before its test was passed, so the course can show it.
export const TEST_SKIPPED_BLOCK = "test-skipped";

export function isCourseDayComplete(blocks: CourseBlock[], finished: ReadonlySet<string>): boolean {
  return blocks.every((b) => b.isOptional || finished.has(b.id)) || EARLIER_CORE_BLOCKS.every((id) => finished.has(id));
}

const SPEAK_A2: Course = {
  level: "A2",
  title: "Understand A2 English",
  shortTitle: "A2 English",
  description:
    "For learners at about A2. One video a day, about an hour: learn its words first, listen three times until you understand all of it, and shadow its sentences. Each week has five video days, a day to hear them again and a free day, and the next week is always ready.",
  tagline: "One video a day, about an hour. A new week every week.",
  days: COURSE_DAYS,
  fallbackCollection: "sponge",
  startLevel: "A2",
  getId: getCourseId,
  getVideos: getDayVideos,
  getBlocks,
};

const NATURAL_B1: Course = {
  level: "B1",
  title: "Natural speed",
  shortTitle: "Natural speed",
  description:
    "For B1 learners who lose track when real people talk fast. One video a day, about an hour: hear it with no subtitles, learn the chunks it uses, listen again until it is all clear, and shadow it. Five video days, a review day and a free day each week, week after week.",
  tagline: "Keep up with fast, real English. About an hour a day.",
  days: COURSE_B1_DAYS,
  fallbackCollection: "bbc",
  startLevel: "B1",
  getId: getCourseB1Id,
  getVideos: getB1DayVideos,
  getBlocks: getB1Blocks,
};

const GENTLE_A2: Course = {
  ...SPEAK_A2,
  title: "Understand A2 English · Gentle",
  shortTitle: "A2 · Gentle",
  description:
    "For A1 learners on the way to A2. The same videos at 0.75x, with fewer and shorter steps: 8 words and 8 sentences from each video, heard until they are clear. Under an hour a day. Take two real days per course day if you need to.",
  tagline: "From A1 to A2, under an hour a day.",
  getBlocks: getGentleBlocks,
  startLevel: "A1",
  isGentle: true,
  phraseCount: GENTLE_PHRASE_COUNT,
  promptCount: GENTLE_PROMPT_COUNT,
  playbackRate: GENTLE_PLAYBACK_RATE,
};

export function getCourse(collection: CollectionId, mode: CourseMode = "full"): Course {
  if (getCollection(collection).speed === "natural") return NATURAL_B1;
  return mode === "gentle" ? GENTLE_A2 : SPEAK_A2;
}

// Whether the collection's course offers the Gentle plan.
export function hasGentlePlan(collection: CollectionId): boolean {
  return getCollection(collection).speed !== "natural";
}
