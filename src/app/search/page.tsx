import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { ListSkeleton } from "@/components/Skeleton";
import { getCollection, isCollectionId } from "@/data/collections";
import { MIN_QUERY_LENGTH, searchSentences, type SentenceHit } from "@/lib/search";

export const metadata: Metadata = { title: "Search phrases · Shadowing English" };

const EXAMPLES = ["get on well", "how about", "I'm afraid", "by the way", "used to"];

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <AppShell active="/search">
      <main className="w-full max-w-3xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "Search phrases" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Search phrases</h1>
        <p className="mt-2 text-muted">Find a word or phrase in every lesson, then hear real people say it and shadow the sentence.</p>
        <Suspense fallback={<SearchForm query="" />}>
          {searchParams.then((sp) => {
            const query = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
            return (
              <>
                <SearchForm query={query} />
                <Suspense key={query} fallback={<ListSkeleton rows={4} />}>
                  <Results query={query} />
                </Suspense>
              </>
            );
          })}
        </Suspense>
      </main>
    </AppShell>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <form action="/search" className="mt-5 flex gap-2" role="search">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Word or phrase</span>
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          maxLength={100}
          placeholder="e.g. get on well"
          className="w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-3 text-base text-ink outline-none focus:border-brand"
        />
      </label>
      <button type="submit" className="btn-3d btn-brand shrink-0 px-5">
        Search
      </button>
    </form>
  );
}

function hitHref(hit: SentenceHit): string {
  return hit.isNews ? `/news/${hit.videoId}` : `/watch/${hit.videoId}?mode=shadow&s=${hit.index}`;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

async function Results({ query }: { query: string }) {
  if (query.trim().length < MIN_QUERY_LENGTH) {
    return (
      <div className="mt-6">
        <p className="text-sm font-semibold text-muted">Try one of these:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Link key={example} href={`/search?q=${encodeURIComponent(example)}`} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:border-brand">
              {example}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const hits = await searchSentences(query);
  if (hits === null) return <p className="mt-6 text-muted">Search isn&apos;t available right now. Please try again later.</p>;
  if (hits.length === 0) {
    return <p className="mt-6 text-muted">No lessons use “{query}” yet. Try a shorter phrase or a different word form.</p>;
  }

  return (
    <>
      <p className="mt-6 text-sm text-muted">
        {hits.length === 60 ? "Top 60" : hits.length} {hits.length === 1 ? "sentence" : "sentences"} with “{query}”
      </p>
      <ul className="mt-3 space-y-2">
        {hits.map((hit) => (
          <li key={`${hit.videoId}-${hit.index}`}>
            <Link href={hitHref(hit)} className="group block rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-brand">
              <p lang="en" className="text-ink">
                {hit.parts.map((part, i) =>
                  part.isMatch ? (
                    <mark key={i} className="rounded bg-brand-soft px-0.5 font-bold text-brand">
                      {part.text}
                    </mark>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                <Icon name={hit.isNews ? "news" : "play"} className="size-3.5 shrink-0" />
                <span className="truncate">
                  {hit.title}
                  {isCollectionId(hit.collectionId) ? ` · ${getCollection(hit.collectionId).name}` : ""} · {formatTime(hit.start)}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
