import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { HomeHeader } from "@/components/HomeHeader";
import { Icon } from "@/components/Icon";
import { StreakCard } from "@/components/StreakCard";
import { VideoLibrary } from "@/components/VideoLibrary";
import type { CuratedVideo } from "@/data/curated";
import { getCatalog } from "@/lib/catalog";
import { getLibraryUserState, getStreak } from "@/lib/user-data";

export default async function HomePage() {
  const videos = await getCatalog();

  return (
    <AppShell active="/">
      <HomeHeader />

      <main className="w-full max-w-6xl px-4 py-5 md:px-10 md:py-8">
        <Suspense fallback={null}>
          <StreakSection />
        </Suspense>

        <Link
          href="/course"
          className="group mt-4 flex items-center gap-4 rounded-3xl border border-brand/25 bg-gradient-to-r from-brand-soft to-surface p-4 transition-transform active:translate-y-0.5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand shadow-[0_3px_0_0_var(--color-brand-dark)]">
            <Icon name="course" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-wide text-accent">7-day course · A2</span>
            <span className="block font-bold text-ink">Speak A2 in 7 days</span>
            <span className="block truncate text-sm text-muted">Already understand A2? Start speaking, 2–3 hours a day.</span>
          </span>
          <Icon name="chevronRight" className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="mt-5">
          {/* The static shell shows the library right away; hearts and progress fill in once the user's data streams in. */}
          <Suspense fallback={<VideoLibrary videos={videos} userState={EMPTY_USER_STATE} />}>
            <LibraryWithUserState videos={videos} />
          </Suspense>
        </div>
      </main>
    </AppShell>
  );
}

const EMPTY_USER_STATE = { favoriteIds: [], progress: {}, continueIds: [] };

async function LibraryWithUserState({ videos }: { videos: CuratedVideo[] }) {
  const userState = await getLibraryUserState().catch(() => EMPTY_USER_STATE);
  return <VideoLibrary videos={videos} userState={userState} />;
}

async function StreakSection() {
  const streak = await getStreak().catch(() => null);
  if (!streak) {
    return (
      <section className="animate-fade-up rounded-3xl border border-brand/20 bg-brand-soft px-5 py-4 text-ink">
        <p className="font-bold">Everyday English for A1–B1 learners</p>
        <p className="mt-1 text-sm text-ink/80">
          Pick a video, tap any word for its meaning, then switch to <b>Shadowing</b> to repeat each sentence.
        </p>
      </section>
    );
  }
  return <StreakCard streak={streak} />;
}
