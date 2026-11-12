import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { DEFAULT_COLLECTION } from "@/data/collections";
import { CourseGuide } from "@/components/course/CourseGuide";
import { CoursePlanSwitch } from "@/components/course/CoursePlanSwitch";
import { getCourse, hasGentlePlan, TEST_SKIPPED_BLOCK, type Course } from "@/data/courses";
import { dayInWeek, weekOf } from "@/data/course-weeks";
import { getCollectionCounts } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getCourseMode } from "@/lib/course-mode";
import { getCoursePlan, getCurrentDay, getDayBlocks, getPlanProgress, isPlanDayComplete, type CoursePlan } from "@/lib/course-plan";
import { buildDaySchedule } from "@/lib/course-schedule";
import { Breadcrumbs } from "@/components/Breadcrumbs";

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
      <Breadcrumbs items={[{ label: "Course" }]} />
      <p className="text-xs font-bold uppercase tracking-wide text-accent">Course · {course.level} · a new week every week</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">{course.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{course.description}</p>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm font-semibold text-ink">
        {[
          ["headphones", "Understand first"],
          ["repeat", "Hear each video three times"],
          ["mic", "Shadow the real voice"],
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
  const plan = await getCoursePlan(collection, mode);
  const { course } = plan;
  const counts = await getCollectionCounts();
  const progress = await getPlanProgress(plan);
  return (
    <>
      <CourseHeader course={course} />
      <div className="mt-4">
        <CourseGuide
          planTitle={course.title}
          scheduleTitle="This is day 2 of your plan; day 1 has no review."
          schedule={buildDaySchedule(getDayBlocks(plan, plan.days[1]))}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CollectionSwitcher current={collection} counts={counts} />
        <p className="min-w-0 flex-1 basis-56 text-sm text-muted">Videos come from this collection. Each collection keeps its own progress.</p>
      </div>
      {hasGentlePlan(collection) ? (
        <CoursePlanSwitch current={mode} />
      ) : (
        <p className="mt-4 rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-muted">
          This course is for B1 learners at natural speed. Starting from A1 or A2?{" "}
          <Link href="/course/level-check" className="font-semibold text-brand">
            Take the 2-minute level check
          </Link>{" "}
          to switch to the Gentle plan with slower videos.
        </p>
      )}
      <WeekList plan={plan} progress={progress} />
    </>
  );
}

interface WeekListProps {
  plan: CoursePlan;
  progress: Record<number, string[]> | null;
}

// Every week of the course; the one the learner is in starts open.
function WeekList({ plan, progress }: WeekListProps) {
  const isComplete = (dayNumber: number) => {
    const day = plan.days.find((d) => d.day === dayNumber);
    return day ? isPlanDayComplete(plan, day, progress) : false;
  };
  const currentWeek = weekOf(getCurrentDay(plan, progress).day);
  const weeks = Array.from({ length: plan.weekCount }, (_, i) => plan.days.filter((d) => weekOf(d.day) === i + 1));
  const completedDays = plan.days.filter((d) => isComplete(d.day)).length;

  return (
    <>
      {progress && (
        <p className="mt-8 text-sm font-semibold text-muted">
          {completedDays} {completedDays === 1 ? "day" : "days"} done · you are in week {currentWeek} of {plan.weekCount}
        </p>
      )}
      <div className="mt-4 space-y-3">
        {weeks.map((days, i) => {
          const week = i + 1;
          const doneInWeek = days.filter((d) => isComplete(d.day)).length;
          return (
            <details key={week} open={week === currentWeek} className="group rounded-3xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-ink">Week {week}</span>
                  <span className="block truncate text-sm text-muted">{[...new Set(days.filter((d) => (d.kind ?? "study") === "study").map((d) => d.title))].join(" · ")}</span>
                </span>
                {progress && (
                  <span className="shrink-0 text-xs font-semibold text-accent">
                    {doneInWeek}/{days.length}
                  </span>
                )}
                <Icon name="chevronDown" className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <ol className="space-y-3 px-4 pb-4">
                {days.map((day) => (
                  <DayRow key={day.day} plan={plan} day={day} progress={progress} isComplete={isComplete} />
                ))}
              </ol>
            </details>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">
        New weeks appear as the collection gets new videos. Each week: five video days, a day to hear them again and a free day.
      </p>
    </>
  );
}

interface DayRowProps {
  plan: CoursePlan;
  day: CoursePlan["days"][number];
  progress: Record<number, string[]> | null;
  isComplete: (dayNumber: number) => boolean;
}

function DayRow({ plan, day, progress, isComplete }: DayRowProps) {
  const done = isComplete(day.day);
  // Signed-in learners unlock days in order; visitors can browse everything.
  const isLocked = progress !== null && day.day > 1 && !isComplete(day.day - 1);
  const blocks = getDayBlocks(plan, day);
  const finished = progress?.[day.day]?.length ?? 0;
  const isTestSkipped = progress?.[day.day]?.includes(TEST_SKIPPED_BLOCK) ?? false;
  const content = (
    <>
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-extrabold ${
          done ? "bg-accent text-white" : isLocked ? "bg-line text-muted" : "bg-brand text-on-brand"
        }`}
      >
        {done ? "✓" : dayInWeek(day.day)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink">
          Day {dayInWeek(day.day)} · {day.title}
        </p>
        <p className="truncate text-sm text-muted">{day.canDo}</p>
        {done && isTestSkipped && <p className="mt-0.5 text-xs font-semibold text-muted">Done · test skipped</p>}
        {progress && !done && finished > 0 && (
          <p className="mt-0.5 text-xs font-semibold text-accent">
            {Math.min(finished, blocks.length)}/{blocks.length} blocks done
          </p>
        )}
      </div>
      {isLocked ? (
        <span className="shrink-0 text-xs font-semibold text-muted">Finish the day before first</span>
      ) : (
        <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
      )}
    </>
  );
  return (
    <li>
      {isLocked ? (
        <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface/60 p-4 opacity-70">{content}</div>
      ) : (
        <Link
          href={`/course/${day.day}`}
          className="flex items-center gap-4 rounded-3xl border border-line bg-cream p-4 transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {content}
        </Link>
      )}
    </li>
  );
}
