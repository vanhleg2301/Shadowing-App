import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { CourseDayView } from "@/components/course/CourseDayView";
import { CourseGuide } from "@/components/course/CourseGuide";
import { ListSkeleton } from "@/components/Skeleton";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { DEFAULT_COLLECTION } from "@/data/collections";
import type { CourseBlock } from "@/data/course-a2";
import { DAYS_PER_WEEK, dayInWeek, weekOf } from "@/data/course-weeks";
import { getCollectionCounts } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getCourseMode } from "@/lib/course-mode";
import { getCoursePlan, getDay, getDayBlocks, getProgressDay, getProgressId } from "@/lib/course-plan";
import { buildDaySchedule } from "@/lib/course-schedule";
import { getStoredLesson } from "@/lib/lessons";
import { getCourseProgress } from "@/lib/user-data";
import { VIDEO_GUIDES } from "@/data/video-guides";
import { buildDayStudy, resolveGuide, type DayGuide, type DayStudy } from "@/lib/video-study";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const FULL_STUDY_SIZE = 10;

// The day's words and sentences come from its main video, the one heard first, and so does its guide.
async function getMainVideoStudy(blocks: CourseBlock[], size: number): Promise<{ study: DayStudy | null; guide: DayGuide | null }> {
  const videoId = blocks.find((b) => b.id === "listen-1")?.videoId;
  if (!videoId) return { study: null, guide: null };
  const lesson = await getStoredLesson(videoId).catch(() => null);
  if (!lesson) return { study: null, guide: null };
  const guide = VIDEO_GUIDES[videoId];
  return { study: buildDayStudy(lesson, size), guide: guide ? resolveGuide(guide, lesson.sentences) : null };
}

// Week 1 is built ahead; later days render on first visit.
export function generateStaticParams() {
  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => ({ day: String(i + 1) }));
}

export default function CourseDayPage({ params }: PageProps<"/course/[day]">) {
  return (
    <AppShell active="/course">
      <main className="w-full max-w-4xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-10">
        <Suspense fallback={<ListSkeleton rows={6} />}>
          {params.then(({ day }) => (
            <DayContent dayNumber={Number(day)} />
          ))}
        </Suspense>
      </main>
    </AppShell>
  );
}

async function DayContent({ dayNumber }: { dayNumber: number }) {
  const collection = (await getSelectedCollection().catch(() => null)) ?? DEFAULT_COLLECTION;
  const mode = await getCourseMode();
  const plan = await getCoursePlan(collection, mode);
  const { course } = plan;
  const day = getDay(plan, dayNumber);
  if (!day) notFound();
  const counts = await getCollectionCounts();
  const courseId = getProgressId(plan, day.day);
  const progress = await getCourseProgress(courseId).catch(() => null);
  const blocks = getDayBlocks(plan, day);
  const studySize = course.phraseCount ?? FULL_STUDY_SIZE;
  // The warm-up replays the last video day, even across a review or free day.
  const previousDay = plan.days.filter((d) => d.day < day.day && (d.kind ?? "study") === "study").at(-1);
  const isStudyDay = (day.kind ?? "study") === "study";
  const [today, previous] = await Promise.all([
    isStudyDay ? getMainVideoStudy(blocks, studySize) : null,
    isStudyDay && previousDay ? getMainVideoStudy(getDayBlocks(plan, previousDay), studySize) : null,
  ]);
  const study = today?.study ?? null;
  const previousStudy = previous?.study ?? null;
  const week = weekOf(day.day);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: "Course", href: "/course" }, { label: `Week ${week} · Day ${dayInWeek(day.day)}` }]} className="" />
        <div className="flex flex-wrap items-center gap-2">
          <CourseGuide planTitle={course.title} scheduleTitle={`This is the plan for day ${day.day}.`} schedule={buildDaySchedule(blocks)} />
          <CollectionSwitcher current={collection} counts={counts} />
        </div>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-accent">
        Week {week} · Day {dayInWeek(day.day)} of {DAYS_PER_WEEK}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{day.title}</h1>
      <p className="mt-2 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-ink">
        <b>Goal:</b> {day.canDo}
      </p>
      <div className="mt-6">
        <CourseDayView
          day={day}
          courseId={courseId}
          blocks={blocks}
          study={study}
          guide={today?.guide ?? null}
          previousStudy={previousStudy}
          progressDay={getProgressDay(day.day)}
          initialDone={progress?.[getProgressDay(day.day)] ?? []}
          isSignedIn={progress !== null}
          hasNextDay={getDay(plan, day.day + 1) !== undefined}
          phraseCount={course.phraseCount}
          promptCount={course.promptCount}
          playbackRate={course.playbackRate}
        />
      </div>
    </>
  );
}
