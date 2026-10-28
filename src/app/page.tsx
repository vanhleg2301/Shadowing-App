import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { CollectionPicker } from "@/components/CollectionPicker";
import { CollectionSwitcher } from "@/components/CollectionSwitcher";
import { HomeHeader } from "@/components/HomeHeader";
import { Icon } from "@/components/Icon";
import { ListSkeleton } from "@/components/Skeleton";
import { StreakCard } from "@/components/StreakCard";
import { VideoLibrary } from "@/components/VideoLibrary";
import { getCourse } from "@/data/courses";
import type { CuratedVideo } from "@/data/curated";
import { getCollectionCounts, getCollectionVideos } from "@/lib/catalog";
import { getSelectedCollection } from "@/lib/collection";
import { getLibraryUserState, getStreak } from "@/lib/user-data";

export default function HomePage() {
  return (
    <AppShell active="/">
      <HomeHeader />

      <main className="w-full max-w-6xl px-4 py-5 md:px-10 md:py-8">
        <Suspense fallback={<ListSkeleton />}>
          <HomeContent />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function HomeContent() {
  const collection = await getSelectedCollection().catch(() => null);
  const counts = await getCollectionCounts();
  if (!collection) {
    return (
      <section className="animate-fade-up">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">Step 1</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink md:text-3xl">How fast do you want them to speak?</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Pick a video collection. Slow is easier to follow; natural speed trains you for real conversations.
        </p>
        <div className="mt-5">
          <CollectionPicker current={null} counts={counts} />
        </div>
      </section>
    );
  }
  const videos = await getCollectionVideos(collection);
  const course = getCourse(collection);

  return (
    <>
      <Suspense fallback={null}>
        <StreakSection />
      </Suspense>

      <div className="mt-4 flex flex-wrap items-stretch gap-3">
        <CollectionSwitcher current={collection} counts={counts} />
        <Link
          href="/course"
          className="group flex min-w-0 flex-1 basis-72 items-center gap-4 rounded-3xl border border-brand/25 bg-gradient-to-r from-brand-soft to-surface p-4 transition-transform active:translate-y-0.5"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand shadow-[0_3px_0_0_var(--color-brand-dark)]">
            <Icon name="course" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-wide text-accent">7-day course · {course.level}</span>
            <span className="block font-bold text-ink">{course.title}</span>
            <span className="block truncate text-sm text-muted">{course.tagline}</span>
          </span>
          <Icon name="chevronRight" className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {videos.length === 0 && (
        <p className="mt-5 rounded-2xl border border-line bg-surface px-4 py-3 text-muted">
          Videos for this collection are still being prepared. Please check back soon, or pick another collection.
        </p>
      )}

      <div className="mt-5">
        <Suspense fallback={<VideoLibrary videos={videos} userState={EMPTY_USER_STATE} />}>
          <LibraryWithUserState videos={videos} />
        </Suspense>
      </div>
    </>
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
