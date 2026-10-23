import type { StudyStats } from "@/lib/user-data";

interface StudyStatsPanelProps {
  stats: StudyStats;
  goalMinutes: number;
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

function getCellClass(minutes: number, goal: number, isFuture: boolean): string {
  if (isFuture) return "bg-transparent";
  if (minutes === 0) return "bg-line";
  if (minutes >= goal) return "bg-brand";
  if (minutes >= goal / 2) return "bg-brand/60";
  return "bg-brand/30";
}

function formatHours(minutes: number): string {
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function StudyStatsPanel({ stats, goalMinutes }: StudyStatsPanelProps) {
  const tiles = [
    { label: "Study time", value: formatHours(stats.totalMinutes) },
    { label: "Days studied", value: stats.activeDays },
    { label: "Lessons finished", value: stats.lessonsCompleted },
    { label: "Words mastered", value: `${stats.wordsMastered}/${stats.wordsSaved}` },
  ];
  const weeks = Array.from({ length: stats.calendar.length / 7 }, (_, w) => stats.calendar.slice(w * 7, w * 7 + 7));

  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <h2 className="text-lg font-bold text-ink">Your progress</h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-cream p-3">
            <dt className="text-xs font-semibold text-muted">{t.label}</dt>
            <dd className="mt-1 text-xl font-extrabold text-ink">{t.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-sm font-bold text-ink">Last 12 weeks</h3>
      <div className="mt-2 flex gap-2">
        <ol className="grid grid-rows-7 gap-1 text-[10px] font-semibold text-muted" aria-hidden="true">
          {DAY_LABELS.map((label, i) => (
            <li key={i} className="flex h-3.5 items-center sm:h-4">
              {label}
            </li>
          ))}
        </ol>
        <ol className="flex flex-1 justify-between gap-1" aria-label="Minutes studied per day, last 12 weeks">
          {weeks.map((week) => (
            <li key={week[0].day}>
              <ol className="grid grid-rows-7 gap-1">
                {week.map((d) => (
                  <li
                    key={d.day}
                    title={d.isFuture ? undefined : `${d.day}: ${d.minutes} min`}
                    aria-label={d.isFuture ? undefined : `${d.day}: ${d.minutes} minutes`}
                    className={`size-3.5 rounded-[4px] sm:size-4 ${getCellClass(d.minutes, goalMinutes, d.isFuture)}`}
                  />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-muted" aria-hidden="true">
        <span>Less</span>
        {["bg-line", "bg-brand/30", "bg-brand/60", "bg-brand"].map((c) => (
          <span key={c} className={`size-3 rounded-[3px] ${c}`} />
        ))}
        <span>Goal met</span>
      </div>
    </section>
  );
}
