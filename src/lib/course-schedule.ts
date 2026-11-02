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
  review: "Ôn lại cụm từ hôm qua",
  listen: "Nghe trước, cố hiểu ý chính",
  phrases: "Học cụm từ, đọc to mỗi cụm 2 lần",
  shadow: "Shadowing: nghe rồi nói theo từng câu",
  dictation: "Dictation: nghe rồi gõ lại",
  speak: "Trả lời câu hỏi thành tiếng, ghi âm rồi nghe lại",
  roleplay: "Đóng vai hội thoại",
  quiz: "Làm quiz kiểm tra cụm từ",
  extra: "Thêm nếu còn sức: video phụ",
};

const SESSION_STARTS = { morning: 8 * 60, midday: 13 * 60 + 30, evening: 20 * 60 };
const EVENING_KINDS: BlockKind[] = ["speak", "roleplay", "quiz", "extra"];
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
      items.push({ time: formatClock(clock), label: "Nghỉ: đứng dậy, uống nước, rời màn hình", minutes: rest, isBreak: true });
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
    toSession("Sáng", SESSION_STARTS.morning, daytime.slice(0, morningEnd)),
    toSession("Đầu giờ chiều", SESSION_STARTS.midday, daytime.slice(morningEnd)),
    toSession("Tối", SESSION_STARTS.evening, blocks.filter((b) => EVENING_KINDS.includes(b.kind))),
  ];
  return sessions.filter((s) => s.items.length > 0);
}
