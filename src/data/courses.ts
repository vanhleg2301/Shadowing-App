// The 7-day course follows the collection's speed: slow and medium collections get "Speak A2 in 7 days",
// natural-speed ones get "Natural speed in 7 days".
import { getCollection, type CollectionId } from "./collections";
import type { CourseMode } from "@/lib/course-mode";
import {
  COURSE_DAYS,
  GENTLE_PHRASE_COUNT,
  GENTLE_PLAYBACK_RATE,
  GENTLE_PROMPT_COUNT,
  getBlocks,
  getCourseId,
  getGentleBlocks,
  type CourseBlock,
  type CourseDay,
} from "./course-a2";
import { COURSE_B1_DAYS, getB1Blocks, getCourseB1Id } from "./course-b1";

export interface Course {
  level: "A2" | "B1";
  title: string;
  // For the compact course button on phones.
  shortTitle: string;
  description: string;
  tagline: string;
  days: CourseDay[];
  getId: (collection: CollectionId) => string;
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

export function isCourseDayComplete(blocks: CourseBlock[], finished: ReadonlySet<string>): boolean {
  return blocks.every((b) => b.isOptional || finished.has(b.id)) || EARLIER_CORE_BLOCKS.every((id) => finished.has(id));
}

const SPEAK_A2: Course = {
  level: "A2",
  title: "Speak A2 in 7 days",
  shortTitle: "Speak A2",
  description:
    "For learners at about A2. Each day is built around one video: learn its words first, listen three times until you understand all of it, shadow its sentences, then hear a second video on the same topic. About 2 hours a day, plus optional speaking.",
  tagline: "Understand real English first, then speak. One video a day, about 2 hours.",
  days: COURSE_DAYS,
  getId: getCourseId,
  getBlocks,
};

const NATURAL_B1: Course = {
  level: "B1",
  title: "Natural speed in 7 days",
  shortTitle: "Natural speed",
  description:
    "For B1 learners who lose track when real people talk fast. Each day: hear a real conversation with no subtitles, learn the chunks it uses, listen again until it is all clear, shadow it, then a second video on the same topic. About 2 hours a day.",
  tagline: "Keep up with fast, real English. About 2 hours a day.",
  days: COURSE_B1_DAYS,
  getId: getCourseB1Id,
  getBlocks: getB1Blocks,
};

const GENTLE_A2: Course = {
  ...SPEAK_A2,
  title: "Speak A2 in 7 days · Gentle",
  shortTitle: "Speak A2 · Gentle",
  description:
    "For A1 learners on the way to A2. The same videos at 0.75x, with fewer and shorter steps: 8 words and 8 sentences from each video, heard until they are clear. About 70 minutes a day. Take two real days per course day if you need to.",
  tagline: "From A1 to A2, about an hour a day.",
  getBlocks: getGentleBlocks,
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
