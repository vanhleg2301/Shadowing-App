import Link from "next/link";
import type { Streak } from "@/lib/user-data";

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

function Flame({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2c1 3.5-1.5 5.5-1.5 8a2.5 2.5 0 0 0 5 0c0-1-.3-1.8-.8-2.6C17.8 9 20 12 20 15a8 8 0 1 1-16 0c0-4.6 4.4-7.4 8-13z" />
    </svg>
  );
}

interface GoalRingProps {
  minutes: number;
  goal: number;
}

function GoalRing({ minutes, goal }: GoalRingProps) {
  const ratio = Math.min(minutes / goal, 1);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const isMet = minutes >= goal;
  return (
    <Link
      href="/account#goal"
      aria-label={`Today ${minutes} of ${goal} minutes. Change your daily goal`}
      className="relative grid size-14 shrink-0 place-items-center"
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="text-center leading-none">
        <span className={`block text-sm font-extrabold ${isMet ? "text-brand" : "text-ink"}`}>{isMet ? "✓" : minutes}</span>
        <span className="block text-[9px] font-bold text-muted">/{goal} min</span>
      </span>
    </Link>
  );
}

interface StreakCardProps {
  streak: Streak;
}

export function StreakCard({ streak }: StreakCardProps) {
  const next = MILESTONES.find((m) => m > streak.days) ?? streak.days + 1;
  const previous = [...MILESTONES].reverse().find((m) => m <= streak.days) ?? 0;
  const progress = Math.round(((streak.days - previous) / (next - previous)) * 100);
  const isBest = streak.days > 0 && streak.days >= streak.longest;

  return (
    <section className="animate-fade-up rounded-3xl border border-accent/25 bg-gradient-to-br from-accent-soft to-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex shrink-0 items-center gap-1.5">
          <Flame className={`size-9 ${streak.days > 0 ? "text-accent" : "text-muted/50"}`} />
          <div>
            <p className="text-3xl font-extrabold leading-none text-ink">{streak.days}</p>
            <p className="text-xs font-semibold text-muted">day streak</p>
          </div>
        </div>
        <GoalRing minutes={Math.floor(streak.todaySeconds / 60)} goal={streak.goalMinutes} />
        <ol className="flex min-w-60 flex-1 justify-between gap-1" aria-label="This week">
          {streak.week.map((d) => (
            <li key={d.day} className="flex flex-col items-center gap-1">
              <span className={`text-[11px] font-bold ${d.isToday ? "text-accent" : "text-muted"}`}>{d.label}</span>
              <span
                aria-label={`${d.day}${d.studied ? " studied" : ""}`}
                className={`grid size-7 place-items-center rounded-full sm:size-8 ${
                  d.studied
                    ? "bg-accent text-white"
                    : d.isToday
                      ? "border-2 border-dashed border-accent/60"
                      : d.isFuture
                        ? "bg-line/60"
                        : "bg-line"
                }`}
              >
                {d.studied && <Flame className="size-3.5" />}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">
          {streak.hasStudiedToday
            ? `${next - streak.days} more day${next - streak.days === 1 ? "" : "s"} to ${next}`
            : streak.days > 0
              ? "Study today to keep your streak"
              : "Watch a lesson to start a streak"}
        </span>
        {isBest ? (
          <span className="shrink-0 rounded-full bg-highlight px-2 py-0.5 text-xs font-bold text-highlight-ink">Personal best</span>
        ) : (
          <Link href="/review" className="shrink-0 text-xs font-semibold text-brand">
            Review words →
          </Link>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
