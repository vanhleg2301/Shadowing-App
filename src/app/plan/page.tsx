import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlanToday } from "@/components/plan/PlanToday";
import { WeekVideoPicker, type PlanVideo } from "@/components/plan/WeekVideoPicker";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import type { CuratedVideo } from "@/data/curated";
import { getCatalog } from "@/lib/catalog";
import { getListenMoreVideos, getPlanLevel, getWeekSuggestions } from "@/lib/plan-videos";
import { getLocalToday } from "@/lib/study-day";
import { getSpeakTopic, getWeekStart } from "@/lib/study-plan";
import { getStudyWeeks, type StudyWeek } from "@/lib/user-data";

export const metadata: Metadata = { title: "My plan · Shadowing English" };

const toPlanVideo = ({ videoId, title, level, duration, topic }: CuratedVideo): PlanVideo => ({ videoId, title, level, duration, topic });

export default function PlanPage() {
  return (
    <AppShell active="/plan">
      <main className="w-full max-w-3xl px-4 py-8 md:px-10">
        <Breadcrumbs items={[{ label: "My plan" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">My plan</h1>
        <p className="mt-2 text-muted">One short video, studied in depth all week. About an hour a day, step by step.</p>
        <Suspense fallback={<ListSkeleton />}>
          <PlanContent />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function PlanContent() {
  let weeks: StudyWeek[] | null;
  try {
    weeks = await getStudyWeeks();
  } catch {
    return <p className="mt-8 text-red-600">Couldn&apos;t load your plan. Please try again later.</p>;
  }
  if (!weeks) return <SignInPrompt message="Sign in to start your plan. It keeps track of your week on all your devices." />;

  const today = await getLocalToday();
  const weekStart = getWeekStart(today);
  const [catalog, level] = await Promise.all([getCatalog().catch(() => []), getPlanLevel()]);
  const current = weeks.find((week) => week.weekStart === weekStart);
  const usedIds = new Set(weeks.map((week) => week.videoId));
  const suggestions = getWeekSuggestions(catalog, level, usedIds, weekStart).map(toPlanVideo);

  if (!current) {
    return (
      <>
        <HowItWorks />
        <WeekVideoPicker weekStart={weekStart} suggestions={suggestions} />
      </>
    );
  }

  return (
    <PlanToday
      key={weekStart}
      weekStart={weekStart}
      today={today}
      weekNumber={weeks.filter((week) => week.weekStart <= weekStart).length}
      video={{ videoId: current.videoId, title: current.title }}
      initialDone={current.done}
      suggestions={suggestions}
      listenMore={getListenMoreVideos(catalog, level, current.videoId, today).map(toPlanVideo)}
      speakTopic={getSpeakTopic(today)}
    />
  );
}

const STEPS = [
  ["Monday", "Listen without the text, then dictation for the parts you can't catch."],
  ["Tuesday – Thursday", "Shadow the video: sentence by sentence first, then along with it."],
  ["Friday", "Check you understand almost everything, and retell the whole video."],
  ["Saturday", "Record yourself talking for 2 minutes. Compare it with earlier weeks."],
  ["Every day", "Say it in your own words and review your words. Add easy listening and speaking if you have time."],
] as const;

function HowItWorks() {
  return (
    <section aria-label="How it works" className="mt-6 rounded-3xl border border-brand/20 bg-brand-soft p-4 sm:p-5">
      <h2 className="text-lg font-extrabold text-ink">How it works</h2>
      <ul className="mt-2 space-y-1.5 text-sm">
        {STEPS.map(([day, text]) => (
          <li key={day}>
            <span className="font-bold text-ink">{day}: </span>
            <span className="text-muted">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
