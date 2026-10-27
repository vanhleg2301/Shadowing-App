import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { DEFAULT_COLLECTION } from "@/data/collections";
import { COURSE_DAYS, getBlocks, getCourseId } from "@/data/course-a2";
import { getSelectedCollection } from "@/lib/collection";
import { getCourseProgress } from "@/lib/user-data";

export default function CoursePage() {
  return (
    <AppShell active="/course">
      <main className="w-full max-w-4xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">7-day course · A2</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Speak A2 in 7 days</h1>
        <p className="mt-2 max-w-2xl text-muted">
          For learners who understand A2 English but freeze when they have to speak. Each day: a short listening, 15 useful
          phrases, lots of shadowing and five questions to answer out loud. Plan for 2–3 hours, or 4 with the bonus.
        </p>

        <ul className="mt-5 grid gap-2 text-sm text-ink sm:grid-cols-3">
          {[
            ["headphones", "Listen first, then read"],
            ["mic", "Shadow the real voice"],
            ["record", "Speak and listen back"],
          ].map(([icon, text]) => (
            <li key={text} className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 py-2.5 font-semibold">
              <Icon name={icon as "mic"} className="size-5 text-brand" />
              {text}
            </li>
          ))}
        </ul>

        <Suspense fallback={<DayList progress={null} />}>
          <DayListWithProgress />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function DayListWithProgress() {
  const collection = (await getSelectedCollection().catch(() => null)) ?? DEFAULT_COLLECTION;
  const progress = await getCourseProgress(getCourseId(collection)).catch(() => null);
  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CollectionSwitcher current={collection} />
        <p className="min-w-0 flex-1 basis-56 text-sm text-muted">Videos come from this collection. Each collection keeps its own progress.</p>
      </div>
      <DayList progress={progress} />
    </>
  );
}

function DayList({ progress }: { progress: Record<number, string[]> | null }) {
  const isComplete = (day: number) => {
    const course = COURSE_DAYS.find((d) => d.day === day);
    if (!course || !progress) return false;
    const finished = new Set(progress[day] ?? []);
    return getBlocks(course).every((b) => b.isOptional || finished.has(b.id));
  };
  const completedDays = COURSE_DAYS.filter((d) => isComplete(d.day)).length;

  return (
    <>
      {progress && (
        <div className="mt-8 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(completedDays / COURSE_DAYS.length) * 100}%` }} />
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted">
            {completedDays}/{COURSE_DAYS.length} days
          </span>
        </div>
      )}
      <ol className="mt-6 space-y-3">
        {COURSE_DAYS.map((day) => {
          const done = isComplete(day.day);
          // Signed-in learners unlock days in order; visitors can browse everything.
          const isLocked = progress !== null && day.day > 1 && !isComplete(day.day - 1);
          const blocks = getBlocks(day);
          const finished = progress?.[day.day]?.length ?? 0;
          const content = (
            <>
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-extrabold ${
                  done ? "bg-accent text-white" : isLocked ? "bg-line text-muted" : "bg-brand text-on-brand"
                }`}
              >
                {done ? "✓" : day.day}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">
                  Day {day.day} · {day.title}
                </p>
                <p className="truncate text-sm text-muted">{day.canDo}</p>
                {progress && !done && finished > 0 && (
                  <p className="mt-0.5 text-xs font-semibold text-accent">
                    {Math.min(finished, blocks.length)}/{blocks.length} blocks done
                  </p>
                )}
              </div>
              {isLocked ? (
                <span className="shrink-0 text-xs font-semibold text-muted">Finish day {day.day - 1} first</span>
              ) : (
                <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
              )}
            </>
          );
          return (
            <li key={day.day} className="animate-fade-up">
              {isLocked ? (
                <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface/60 p-4 opacity-70">{content}</div>
              ) : (
                <Link
                  href={`/course/${day.day}`}
                  className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_0_0_var(--color-line)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
