import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ListSkeleton } from "@/components/Skeleton";
import { STORIES, STORY_TOPICS, getStoryLabel, getStoryOfTheDay, type Story } from "@/data/stories";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = { title: "Daily stories · Shadowing English" };

export default function StoriesPage({ searchParams }: PageProps<"/stories">) {
  return (
    <AppShell active="/stories">
      <main className="w-full max-w-6xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "Daily stories" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Daily stories</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Short stories and everyday conversations. Read them, or press play and listen like a podcast. Each one ends with
          the words and grammar to notice.
        </p>
        <Suspense fallback={<ListSkeleton />}>
          {searchParams.then((sp) => (
            <StoriesContent topic={typeof sp.topic === "string" ? sp.topic : null} />
          ))}
        </Suspense>
        <p className="mt-8 text-sm text-muted">
          Looking for real news?{" "}
          <Link href="/news" className="font-semibold text-brand">
            VOA news archive
          </Link>
        </p>
      </main>
    </AppShell>
  );
}

async function StoriesContent({ topic }: { topic: string | null }) {
  await connection();
  const today = getStoryOfTheDay();
  const current = topic && STORY_TOPICS.includes(topic) ? topic : null;
  const stories = current ? STORIES.filter((s) => s.topic === current) : STORIES;

  return (
    <>
      <Link
        href={`/stories/${today.id}`}
        className="mt-6 block rounded-3xl border border-brand/25 bg-gradient-to-br from-brand-soft to-surface p-5 transition-transform hover:-translate-y-0.5"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-accent">Today&apos;s story</p>
        <p className="mt-1 text-2xl font-extrabold text-ink">{today.title}</p>
        <p className="mt-1 text-muted">{today.summary}</p>
        <p className="mt-2 text-sm font-semibold text-brand">
          {getStoryLabel(today)} · Read or listen →
        </p>
      </Link>

      <nav aria-label="Topics" className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {[null, ...STORY_TOPICS].map((t) => (
          <Link
            key={t ?? "all"}
            href={t ? `/stories?topic=${encodeURIComponent(t)}` : "/stories"}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${
              t === current ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-ink"
            }`}
          >
            {t ?? "All"}
          </Link>
        ))}
      </nav>

      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </ul>
    </>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <li>
      <Link href={`/stories/${story.id}`} className="block h-full rounded-3xl border border-line bg-surface p-4 transition-colors hover:border-brand">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">
          {getStoryLabel(story)}
        </p>
        <p className="mt-1 font-bold text-ink">{story.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{story.summary}</p>
      </Link>
    </li>
  );
}
