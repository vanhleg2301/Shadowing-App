// Simplified SM-2 scheduling (the algorithm behind Anki). Shared by the review UI (button labels)
// and the server action (the stored schedule), so both always agree.

export type Grade = "again" | "hard" | "good" | "easy";

export interface ReviewState {
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
}

export interface ScheduledReview extends ReviewState {
  dueAt: Date;
}

const MIN_EASE = 1.3;
const AGAIN_DELAY_MIN = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export function schedule(state: ReviewState, grade: Grade, now: Date): ScheduledReview {
  const { intervalDays, ease, reps, lapses } = state;

  if (grade === "again") {
    return {
      intervalDays: 0,
      ease: Math.max(MIN_EASE, ease - 0.2),
      reps: 0,
      lapses: lapses + 1,
      dueAt: new Date(now.getTime() + AGAIN_DELAY_MIN * 60 * 1000),
    };
  }

  let nextInterval: number;
  let nextEase = ease;
  if (grade === "hard") {
    nextInterval = Math.max(1, intervalDays * 1.2);
    nextEase = Math.max(MIN_EASE, ease - 0.15);
  } else if (grade === "good") {
    nextInterval = reps === 0 ? 1 : reps === 1 ? 3 : intervalDays * ease;
  } else {
    nextInterval = reps === 0 ? 4 : Math.max(intervalDays * ease * 1.3, 4);
    nextEase = ease + 0.15;
  }

  const rounded = Math.round(nextInterval);
  return {
    intervalDays: rounded,
    ease: nextEase,
    reps: reps + 1,
    lapses,
    dueAt: new Date(now.getTime() + rounded * DAY_MS),
  };
}

export function formatDelay(from: Date, to: Date): string {
  const minutes = Math.round((to.getTime() - from.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const days = Math.round(minutes / (60 * 24));
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months}mo` : `${Math.round(months / 12)}y`;
}
