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
import { COURSE_DIALOGUES, type CourseDialogue } from "./course-a2-dialogues";
import { COURSE_A2_SAMPLE_ANSWERS } from "./course-a2-samples";
import { COURSE_B1_DAYS, getB1Blocks, getCourseB1Id } from "./course-b1";
import { COURSE_B1_DIALOGUES } from "./course-b1-dialogues";

export interface Course {
  level: "A2" | "B1";
  title: string;
  // For the compact course button on phones.
  shortTitle: string;
  description: string;
  tagline: string;
  days: CourseDay[];
  dialogues: Record<number, CourseDialogue>;
  getId: (collection: CollectionId) => string;
  getBlocks: (day: CourseDay, collection: CollectionId) => CourseBlock[];
  // Only the A2 course has a Gentle plan; these trim each day and slow the videos down.
  isGentle?: boolean;
  phraseCount?: number;
  promptCount?: number;
  playbackRate?: number;
  sampleAnswers?: Record<number, string[]>;
}

const SPEAK_A2: Course = {
  level: "A2",
  title: "Speak A2 in 7 days",
  shortTitle: "Speak A2",
  description:
    "For learners who understand A2 English but freeze when they have to speak. Each day: a short listening, 15 useful phrases, lots of shadowing and five questions to answer out loud. Plan for 2–3 hours, or 4 with the bonus.",
  tagline: "Already understand A2? Start speaking, 2–3 hours a day.",
  days: COURSE_DAYS,
  dialogues: COURSE_DIALOGUES,
  getId: getCourseId,
  getBlocks,
};

const NATURAL_B1: Course = {
  level: "B1",
  title: "Natural speed in 7 days",
  shortTitle: "Natural speed",
  description:
    "For B1 learners who lose track when real people talk fast. Each day: listen without subtitles, shadow two videos, learn 15 phrases people really use, then retell and role-play out loud. Plan for 3 hours, or 3.5 with the bonus.",
  tagline: "Keep up with fast, real English. Listen and speak, 3 hours a day.",
  days: COURSE_B1_DAYS,
  dialogues: COURSE_B1_DIALOGUES,
  getId: getCourseB1Id,
  getBlocks: getB1Blocks,
};

const GENTLE_A2: Course = {
  ...SPEAK_A2,
  title: "Speak A2 in 7 days · Gentle",
  shortTitle: "Speak A2 · Gentle",
  description:
    "For A1 learners on the way to A2. The same 7 days, with fewer and shorter steps: one video at 0.75x, 8 key phrases and 3 questions with an example answer to copy. About 60–75 minutes a day. Take two real days per course day if you need to.",
  tagline: "From A1 to A2, about an hour a day.",
  dialogues: {},
  getBlocks: getGentleBlocks,
  isGentle: true,
  phraseCount: GENTLE_PHRASE_COUNT,
  promptCount: GENTLE_PROMPT_COUNT,
  playbackRate: GENTLE_PLAYBACK_RATE,
  sampleAnswers: COURSE_A2_SAMPLE_ANSWERS,
};

export function getCourse(collection: CollectionId, mode: CourseMode = "full"): Course {
  if (getCollection(collection).speed === "natural") return NATURAL_B1;
  return mode === "gentle" ? GENTLE_A2 : SPEAK_A2;
}

// Whether the collection's course offers the Gentle plan.
export function hasGentlePlan(collection: CollectionId): boolean {
  return getCollection(collection).speed !== "natural";
}
