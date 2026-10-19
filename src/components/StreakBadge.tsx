import type { Streak } from "@/lib/user-data";

interface StreakBadgeProps {
  streak: Streak;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const isActive = streak.days > 0;
  const label = !isActive
    ? "Start your streak today"
    : `${streak.days}-day streak${streak.hasStudiedToday ? "" : " · study today to keep it"}`;

  return (
    <span
      className={`flex animate-fade-in items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
        isActive ? "bg-orange-100 text-orange-700" : "bg-line/60 text-muted"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
        <path d="M12 2c1 3.5-1.5 5.5-1.5 8a2.5 2.5 0 0 0 5 0c0-1-.3-1.8-.8-2.6C17.8 9 20 12 20 15a8 8 0 1 1-16 0c0-4.6 4.4-7.4 8-13z" />
      </svg>
      {label}
    </span>
  );
}
