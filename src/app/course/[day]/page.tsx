import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { CourseDayView } from "@/components/course/CourseDayView";
import { ListSkeleton } from "@/components/Skeleton";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { DEFAULT_COLLECTION } from "@/data/collections";
import { COURSE_DAYS } from "@/data/course-a2";
import { getCourse } from "@/data/courses";
import { getCollectionCounts } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getCourseMode } from "@/lib/course-mode";
import { getCourseProgress } from "@/lib/user-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export function generateStaticParams() {
  return COURSE_DAYS.map((d) => ({ day: String(d.day) }));
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
  const course = getCourse(collection, mode);
  const day = course.days.find((d) => d.day === dayNumber);
  if (!day) notFound();
  const counts = await getCollectionCounts();
  const courseId = course.getId(collection);
  const progress = await getCourseProgress(courseId).catch(() => null);
  const blocks = course.getBlocks(day, collection);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs items={[{ label: "7-day course", href: "/course" }, { label: `Day ${day.day}` }]} className="" />
        <CollectionSwitcher current={collection} counts={counts} />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-accent">Day {day.day} of 7</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{day.title}</h1>
      <p className="mt-2 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-ink">
        <b>Goal:</b> {day.canDo}
      </p>
      <div className="mt-6">
        <CourseDayView
          day={day}
          courseId={courseId}
          blocks={blocks}
          dialogue={course.dialogues[day.day]}
          initialDone={progress?.[day.day] ?? []}
          isSignedIn={progress !== null}
          hasNextDay={day.day < course.days.length}
          phraseCount={course.phraseCount}
          promptCount={course.promptCount}
          playbackRate={course.playbackRate}
          sampleAnswers={course.sampleAnswers?.[day.day]}
        />
      </div>
    </>
  );
}
