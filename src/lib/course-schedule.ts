// Turns a course day's steps into a suggested timetable for the "?" guide. Times are a suggestion; the order is what
// matters.
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
  review: "Warm up: hear sentences from 1, 3 and 7 days back",
  words: "Learn the video's words",
  watch: "Watch the video twice: text hidden, then with the text",
  practice: "Practise 5 sentences: hear, write, say",
  quiz: "Take the day test: it finishes the day",
  more: "If you have time: take turns, speak, more videos",
  listen: "Listen with the text hidden and get the main idea",
  free: "Listen to anything you enjoy",
};

const SESSION_STARTS = { main: 8 * 60, extra: 20 * 60 };
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

// The day's steps in one sitting with short breaks; the optional ones later, if there is time.
export function buildDaySchedule(blocks: CourseBlock[]): ScheduleSession[] {
  const sessions = [
    toSession("The day's steps", SESSION_STARTS.main, blocks.filter((b) => !b.isOptional)),
    toSession("If you have time", SESSION_STARTS.extra, blocks.filter((b) => b.isOptional)),
  ];
  return sessions.filter((s) => s.items.length > 0);
}
