// The 7-day course follows the collection's speed: slow and medium collections get "Speak A2 in 7 days",
// natural-speed ones get "Natural speed in 7 days".
import { getCollection, type CollectionId } from "./collections";
import { COURSE_DAYS, getBlocks, getCourseId, type CourseBlock, type CourseDay } from "./course-a2";
import { COURSE_DIALOGUES, type CourseDialogue } from "./course-a2-dialogues";
import { COURSE_B1_DAYS, getB1Blocks, getCourseB1Id } from "./course-b1";
import { COURSE_B1_DIALOGUES } from "./course-b1-dialogues";

export interface Course {
  level: "A2" | "B1";
  title: string;
  description: string;
  tagline: string;
  days: CourseDay[];
  dialogues: Record<number, CourseDialogue>;
  getId: (collection: CollectionId) => string;
  getBlocks: (day: CourseDay, collection: CollectionId) => CourseBlock[];
}

const SPEAK_A2: Course = {
  level: "A2",
  title: "Speak A2 in 7 days",
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
  description:
    "For B1 learners who lose track when real people talk fast. Each day: listen without subtitles, shadow two videos, learn 15 phrases people really use, then retell and role-play out loud. Plan for 3 hours, or 3.5 with the bonus.",
  tagline: "Keep up with fast, real English. Listen and speak, 3 hours a day.",
  days: COURSE_B1_DAYS,
  dialogues: COURSE_B1_DIALOGUES,
  getId: getCourseB1Id,
  getBlocks: getB1Blocks,
};

export function getCourse(collection: CollectionId): Course {
  return getCollection(collection).speed === "natural" ? NATURAL_B1 : SPEAK_A2;
}
