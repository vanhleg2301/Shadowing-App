import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthButton } from "@/components/AuthButton";
import { Icon } from "@/components/Icon";
import { PasteLinkForm } from "@/components/PasteLinkForm";
import { VideoLibrary } from "@/components/VideoLibrary";
import { CURATED_VIDEOS } from "@/data/curated";
import { getFavoriteIds } from "@/lib/user-data";

export default function HomePage() {
  return (
    <AppShell active="/">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 px-4 py-4 backdrop-blur md:px-10">
        <div className="flex max-w-3xl items-start gap-3">
          <PasteLinkForm />
          <div className="shrink-0 md:hidden">
            <AuthButton variant="compact" />
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Hi there, ready to practice?</h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">Shadowing</span>
          <span className="text-muted">Learning English</span>
        </div>

        <section className="mt-8 flex items-center gap-4 rounded-3xl border border-brand/20 bg-brand-soft px-5 py-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-[0_3px_0_0_var(--color-brand-dark)]">
            <Icon name="play" />
          </span>
          <p className="text-ink">
            Everyday English for A1–B1 learners. Pick a topic, tap any word to see its meaning, then switch to{" "}
            <b>Shadowing</b> to repeat each sentence.
          </p>
        </section>

        <div className="mt-8">
          {/* The static shell shows the library right away; hearts fill in once the user's favorites stream in. */}
          <Suspense fallback={<VideoLibrary videos={CURATED_VIDEOS} favoriteIds={[]} />}>
            <LibraryWithFavorites />
          </Suspense>
        </div>
      </main>
    </AppShell>
  );
}

async function LibraryWithFavorites() {
  const favoriteIds = await getFavoriteIds().catch(() => []);
  return <VideoLibrary videos={CURATED_VIDEOS} favoriteIds={favoriteIds} />;
}
