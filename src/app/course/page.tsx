import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { DEFAULT_COLLECTION } from "@/data/collections";
import { CoursePlanSwitch } from "@/components/course/CoursePlanSwitch";
import { getCourse, hasGentlePlan, type Course } from "@/data/courses";
import type { CollectionId } from "@/data/collections";
import { getCollectionCounts } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getCourseMode } from "@/lib/course-mode";
import { getCourseProgress } from "@/lib/user-data";

export default function CoursePage() {
  return (
    <AppShell active="/course">
      <main className="w-full max-w-4xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Suspense fallback={<CourseHeader course={getCourse(DEFAULT_COLLECTION)} />}>
          <CourseWithProgress />
        </Suspense>
      </main>
    </AppShell>
  );
}

function CourseHeader({ course }: { course: Course }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-wide text-accent">7-day course · {course.level}</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">{course.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{course.description}</p>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm font-semibold text-ink">
        {[
          ["headphones", "Listen first"],
          ["mic", "Shadow the real voice"],
          ["record", "Speak and listen back"],
        ].map(([icon, text]) => (
          <li key={text} className="flex items-center gap-1.5">
            <Icon name={icon as "mic"} className="size-4 text-brand" />
            {text}
          </li>
        ))}
      </ul>
    </>
  );
}

async function CourseWithProgress() {
  const collection = (await getSelectedCollection().catch(() => null)) ?? DEFAULT_COLLECTION;
  const mode = await getCourseMode();
  const course = getCourse(collection, mode);
  const counts = await getCollectionCounts();
  const progress = await getCourseProgress(course.getId(collection)).catch(() => null);
  return (
    <>
      <CourseHeader course={course} />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CollectionSwitcher current={collection} counts={counts} />
        <p className="min-w-0 flex-1 basis-56 text-sm text-muted">Videos come from this collection. Each collection keeps its own progress.</p>
      </div>
      {hasGentlePlan(collection) && <CoursePlanSwitch current={mode} />}
      <DayList course={course} collection={collection} progress={progress} />
    </>
  );
}

interface DayListProps {
  course: Course;
  collection: CollectionId;
  progress: Record<number, string[]> | null;
}

function DayList({ course, collection, progress }: DayListProps) {
  const days = course.days;
  const isComplete = (dayNumber: number) => {
    const day = days.find((d) => d.day === dayNumber);
    if (!day || !progress) return false;
    const finished = new Set(progress[dayNumber] ?? []);
    return course.getBlocks(day, collection).every((b) => b.isOptional || finished.has(b.id));
  };
  const completedDays = days.filter((d) => isComplete(d.day)).length;

  return (
    <>
      {progress && (
        <div className="mt-8 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(completedDays / days.length) * 100}%` }} />
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted">
            {completedDays}/{days.length} days
          </span>
        </div>
      )}
      <ol className="mt-6 space-y-3">
        {days.map((day) => {
          const done = isComplete(day.day);
          // Signed-in learners unlock days in order; visitors can browse everything.
          const isLocked = progress !== null && day.day > 1 && !isComplete(day.day - 1);
          const blocks = course.getBlocks(day, collection);
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
