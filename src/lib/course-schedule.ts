// Turns a course day's steps into a suggested timetable for the "?" guide: morning for new material, the middle of
// the day for the second video, the evening for speaking. Times are a suggestion; the order is what matters.
import type { BlockKind, CourseBlock } from "@/data/course-a2";

export interface ScheduleItem {
  time: string;
  label: string;
  minutes: number;
  isBreak?: boolean;
  isOptional?: boolean;
}

export interface ScheduleSession {
  name: string;
  items: ScheduleItem[];
}

const LABELS: Record<BlockKind, string> = {
  review: "Listen again to yesterday's sentences",
  words: "Learn the video's words before you listen",
  listen: "Listen with the text hidden and get the main idea",
  readalong: "Listen with the text and tap the words you don't know",
  phrases: "Hear and repeat the sentences from the video",
  shadow: "Shadow: listen and repeat each sentence",
  speak: "If you like: retell the video out loud",
  quiz: "Fill the gaps in the video's sentences",
  extra: "If you have energy: bonus video",
};

const SESSION_STARTS = { morning: 8 * 60, midday: 13 * 60 + 30, evening: 20 * 60 };
const EVENING_KINDS: BlockKind[] = ["speak", "quiz", "extra"];
const LONG_STEP_MINUTES = 30;
const LONG_BREAK_MINUTES = 10;
const SHORT_BREAK_MINUTES = 5;

function formatClock(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

function toSession(name: string, start: number, blocks: CourseBlock[]): ScheduleSession {
  const items: ScheduleItem[] = [];
  let clock = start;
  blocks.forEach((block, i) => {
    items.push({ time: formatClock(clock), label: LABELS[block.kind], minutes: block.minutes, isOptional: block.isOptional });
    clock += block.minutes;
    if (i < blocks.length - 1) {
      const rest = block.minutes >= LONG_STEP_MINUTES ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES;
      items.push({ time: formatClock(clock), label: "Break: stand up, drink water, leave the screen", minutes: rest, isBreak: true });
      clock += rest;
    }
  });
  return { name, items };
}

export function buildDaySchedule(blocks: CourseBlock[]): ScheduleSession[] {
  const daytime = blocks.filter((b) => !EVENING_KINDS.includes(b.kind));
  // The morning runs until the day's phrases and its first shadowing are both done.
  const morningEnd = Math.max(daytime.findIndex((b) => b.kind === "phrases"), daytime.findIndex((b) => b.kind === "shadow")) + 1;
  const sessions = [
    toSession("Morning", SESSION_STARTS.morning, daytime.slice(0, morningEnd)),
    toSession("Early afternoon", SESSION_STARTS.midday, daytime.slice(morningEnd)),
    toSession("Evening", SESSION_STARTS.evening, blocks.filter((b) => EVENING_KINDS.includes(b.kind))),
  ];
  return sessions.filter((s) => s.items.length > 0);
}
