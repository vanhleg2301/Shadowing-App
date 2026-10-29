// Long videos are studied in parts of about 5 minutes, cut between sentences, so every lesson stays short.
import type { Lesson, Sentence } from "./lesson";

const PART_TARGET_SEC = 300;
// Videos up to 7 minutes stay whole.
const SPLIT_ABOVE_SEC = 420;

export interface LessonPart {
  index: number;
  total: number;
  // Index of the part's first sentence in the whole lesson.
  offset: number;
  sentenceCount: number;
}

export function getPartCount(durationSec: number): number {
  return durationSec > SPLIT_ABOVE_SEC ? Math.max(2, Math.round(durationSec / PART_TARGET_SEC)) : 1;
}

function toSeconds(duration: string): number {
  return duration.split(":").reduce((total, part) => total * 60 + (Number(part) || 0), 0);
}

// "3 × 5 min" for a catalog duration like "14:52"; null when the video stays whole.
export function formatParts(duration: string | undefined): string | null {
  if (!duration) return null;
  const seconds = toSeconds(duration);
  const total = getPartCount(seconds);
  return total > 1 ? `${total} × ${Math.round(seconds / total / 60)} min` : null;
}

// Each part takes the sentences that start in its share of the video's length.
function getPartIndex(sentence: Sentence, length: number, total: number): number {
  return Math.min(total, Math.floor((sentence.start / length) * total) + 1);
}

export function getPartForSentence(lesson: Lesson, sentenceIndex: number): number {
  const length = lesson.sentences.at(-1)?.end ?? lesson.durationSec;
  const sentence = lesson.sentences[sentenceIndex];
  return sentence ? getPartIndex(sentence, length, getPartCount(length)) : 1;
}

// The lesson cut down to one part, or null when it is short enough to study whole.
export function getLessonPart(lesson: Lesson, requested: number): { lesson: Lesson; part: LessonPart } | null {
  const length = lesson.sentences.at(-1)?.end ?? lesson.durationSec;
  const total = getPartCount(length);
  if (total === 1) return null;
  const index = Math.min(Math.max(Math.round(requested) || 1, 1), total);
  const offset = lesson.sentences.findIndex((s) => getPartIndex(s, length, total) >= index);
  const sentences = lesson.sentences.filter((s) => getPartIndex(s, length, total) === index);
  if (offset < 0 || sentences.length === 0) return null;
  return {
    lesson: { ...lesson, sentences },
    part: { index, total, offset, sentenceCount: lesson.sentences.length },
  };
}
