// The test at the end of a course day: a day only counts as finished once it is passed. Every question comes
// from the day's video: hear a sentence and pick it, fill a gap with the day's words, and, when the video has a
// written guide, answer questions about what was said.
import type { CoursePhrase } from "@/data/course-a2";
import type { GuideQuestion } from "@/data/video-guides";
import type { DayStudy, StudySentence } from "./video-study";

export type TestQuestion =
  | { kind: "listen"; sentence: StudySentence; options: string[]; answer: string }
  | { kind: "gap"; prompt: string; hint: string; options: string[]; answer: string }
  | { kind: "meaning"; prompt: string; options: string[]; answer: string; image?: string };

export const BLANK = "_____";
const LISTEN_COUNT = 4;
const GAP_COUNT = 6;
const GUIDE_COUNT = 4;
const PASS_RATIO = 0.8;

// Seeded shuffle so the server and the browser build the same test.
export function shuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 9301 + 49297) % 233280;
    const j = Math.floor((state / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const getPassScore = (count: number) => Math.ceil(count * PASS_RATIO);

function buildGapQuestions(phrases: CoursePhrase[], seed: number): TestQuestion[] {
  return shuffle(phrases, seed)
    .slice(0, GAP_COUNT)
    .flatMap((p, i): TestQuestion[] => {
      const options = shuffle([p, ...shuffle(phrases.filter((o) => o.text !== p.text), seed + i + 1).slice(0, 3)], seed + i + 100).map((o) => o.text);
      const index = p.example.toLowerCase().indexOf(p.text.toLowerCase());
      // Phrases taken from a video have no written meaning, only the sentence they were heard in.
      if ((i % 2 === 0 || !p.meaning) && index >= 0) {
        const prompt = p.example.slice(0, index) + BLANK + p.example.slice(index + p.text.length);
        return [{ kind: "gap", prompt, hint: p.meaning ? "Complete the sentence." : "Complete the sentence from the video.", answer: p.text, options }];
      }
      return p.meaning ? [{ kind: "gap", prompt: p.meaning, hint: "Which phrase means this?", answer: p.text, options }] : [];
    });
}

function buildListenQuestions(study: DayStudy, seed: number): TestQuestion[] {
  const sentences = study.sentences;
  if (sentences.length < 3) return [];
  return shuffle(sentences, seed + 7)
    .slice(0, LISTEN_COUNT)
    .map((sentence, i) => {
      const others = shuffle(sentences.filter((s) => s.index !== sentence.index), seed + i + 200).slice(0, 2);
      return { kind: "listen", sentence, answer: sentence.text, options: shuffle([sentence, ...others], seed + i + 300).map((s) => s.text) };
    });
}

function buildGuideQuestions(questions: GuideQuestion[], seed: number): TestQuestion[] {
  return shuffle(questions, seed + 11)
    .slice(0, GUIDE_COUNT)
    .map((q, i) => ({ kind: "meaning", prompt: q.question, answer: q.options[0], options: shuffle(q.options, seed + i + 400) }));
}

export function buildDayTest(study: DayStudy | null, phrases: CoursePhrase[], guideQuestions: GuideQuestion[], seed: number): TestQuestion[] {
  return [
    ...(study ? buildListenQuestions(study, seed) : []),
    ...buildGapQuestions(phrases, seed),
    ...buildGuideQuestions(guideQuestions, seed),
  ];
}
