"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { ScrollRow } from "@/components/ScrollRow";
import { ShowMore } from "@/components/ShowMore";
import { LEVEL_DOT, VideoCard } from "@/components/VideoCard";
import { LEVEL_STORAGE_KEY } from "@/data/placement";
import { LEVELS, orderTopics, type CuratedVideo, type Level, type Topic } from "@/data/curated";
import { getThumbnailUrl } from "@/lib/media";
import type { LibraryUserState } from "@/lib/user-data";

interface VideoLibraryProps {
  videos: CuratedVideo[];
  userState: LibraryUserState;
}

// Phones show one and a half cards per row, so it's clear the row scrolls sideways.
const CARD_WIDTH = "w-[68%] shrink-0 snap-start sm:w-[45%] xl:w-[31%]";
const PLACEMENT_TIP_KEY = "placement-tip-hidden";

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function VideoLibrary({ videos, userState }: VideoLibraryProps) {
  const { favoriteIds, progress, continueIds } = userState;
  const [chosenLevel, setLevel] = useState<Level | "all">("all");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [query, setQuery] = useState("");
  const [hasPlacement, setHasPlacement] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LEVEL_STORAGE_KEY);
    } catch {
      // Storage blocked: keep showing all levels.
    }
    const storedLevel = LEVELS.find((l) => l === stored && videos.some((v) => v.level === l));
    // Reading localStorage only works after hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (storedLevel) setLevel(storedLevel);
    setHasPlacement(LEVELS.some((l) => l === stored) || readFlag(PLACEMENT_TIP_KEY));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [videos]);

  // Shown until the learner takes the test or hides the tip once.
  const dismissPlacement = () => {
    setHasPlacement(true);
    try {
      localStorage.setItem(PLACEMENT_TIP_KEY, "1");
    } catch {
      // Storage blocked: the tip comes back next visit.
    }
  };

  const continueVideos = continueIds
    .map((id) => videos.find((v) => v.videoId === id))
    .filter((v): v is CuratedVideo => v !== undefined);
  const [featured, ...moreToContinue] = continueVideos;

  const needle = query.trim().toLowerCase();
  // A level the current collection doesn't have (after switching collection) falls back to all.
  const level = videos.some((v) => v.level === chosenLevel) ? chosenLevel : "all";
  const byLevel = videos.filter((v) => level === "all" || v.level === level);
  const sections = orderTopics(videos.map((v) => v.topic))
    .map((t) => ({ topic: t, items: byLevel.filter((v) => v.topic === t) }))
    .filter((s) => s.items.length > 0);
  const gridVideos = needle
    ? byLevel.filter((v) => `${v.title} ${v.topic}`.toLowerCase().includes(needle))
    : topic
      ? byLevel.filter((v) => v.topic === topic)
      : null;

  const card = (video: CuratedVideo) => (
    <VideoCard video={video} isFavorite={favoriteIds.includes(video.videoId)} progress={progress[video.videoId]} />
  );

  return (
    <>
      {!needle && featured && (
        <Link
          href={`/watch/${featured.videoId}`}
          className="group flex animate-fade-up items-center gap-4 rounded-3xl border border-line bg-surface p-3 shadow-[0_4px_0_0_var(--color-line)] transition-transform active:translate-y-0.5"
        >
          <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-2xl sm:w-48">
            <Image
              src={getThumbnailUrl(featured.videoId)}
              alt=""
              fill
              sizes="200px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-10 place-items-center rounded-full bg-brand text-on-brand shadow-lg">
                <Icon name="play" className="size-5" />
              </span>
            </span>
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
              <div className="h-full bg-accent" style={{ width: `${Math.min(progress[featured.videoId] ?? 0, 100)}%` }} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-accent">
              <Icon name="repeat" className="size-3.5" />
              Continue learning
            </p>
            <p className="mt-1 line-clamp-2 font-bold leading-snug text-ink">{featured.title}</p>
            <p className="mt-1 text-sm text-muted">{progress[featured.videoId] ?? 0}% done</p>
          </div>
        </Link>
      )}

      {!needle && !hasPlacement && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-brand/25 bg-brand-soft py-1 pl-4 pr-1 first:mt-0">
          <Link href="/placement" className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2">
            <span className="min-w-0">
              <span className="block font-bold text-ink">Not sure which level to pick?</span>
              <span className="block text-sm text-muted">Take a 3-minute test and we&apos;ll show the right videos.</span>
            </span>
            <Icon name="next" className="size-5 shrink-0 text-brand" />
          </Link>
          <button type="button" onClick={dismissPlacement} className="shrink-0 p-2.5 text-muted hover:text-ink" aria-label="Hide this tip">
            <Icon name="close" className="size-4" />
          </button>
        </div>
      )}

      {/* Search and filters stay in reach while scrolling the long library. */}
      <div className="sticky top-0 z-20 -mx-4 mt-4 bg-cream/95 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] backdrop-blur-xl md:mx-0 md:px-0">
        <label className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
          <Icon name="search" className="size-5 shrink-0 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find videos to study..."
            aria-label="Search videos"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-ink outline-none placeholder:text-muted"
          />
        </label>
        <div className="no-scrollbar -mx-4 mt-2 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <div role="radiogroup" aria-label="Level" className="flex shrink-0 rounded-2xl border border-line bg-surface p-1">
            {(["all", ...LEVELS.filter((l) => videos.some((v) => v.level === l))] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={level === l}
                onClick={() => setLevel(l)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
                  level === l ? "bg-ink text-cream" : "text-muted hover:text-ink"
                }`}
              >
                {l !== "all" && <span className={`size-2 rounded-full ${LEVEL_DOT[l]}`} />}
                {l === "all" ? "All" : l}
              </button>
            ))}
          </div>
          <span className="mx-1 h-6 w-px shrink-0 bg-line" />
          <button
            type="button"
            onClick={() => setTopic(null)}
            className={`btn-3d shrink-0 px-4 py-2 text-sm ${topic === null ? "btn-dark" : ""}`}
          >
            All topics
          </button>
          {sections.map((s) => (
            <button
              key={s.topic}
              type="button"
              onClick={() => setTopic(s.topic)}
              className={`btn-3d shrink-0 whitespace-nowrap px-4 py-2 text-sm ${topic === s.topic ? "btn-dark" : ""}`}
            >
              {s.topic}
              <span className={`text-xs ${topic === s.topic ? "text-cream/70" : "text-muted"}`}>{s.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      {gridVideos ? (
        <section className="mt-6">
          <h2 className="text-2xl font-extrabold text-ink">{needle ? `Results for “${query.trim()}”` : topic}</h2>
          <ShowMore resetKey={`${topic}-${level}-${needle}`} className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {gridVideos.map((video) => (
              <div key={video.videoId}>{card(video)}</div>
            ))}
          </ShowMore>
          {gridVideos.length === 0 && <p className="mt-6 text-muted">No videos found. Try another word or level.</p>}
        </section>
      ) : (
        <>
          {moreToContinue.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-extrabold text-ink md:text-2xl">Also in progress</h2>
              <div className="mt-3">
                <ScrollRow label="Also in progress">
                  {moreToContinue.map((video) => (
                    <div key={video.videoId} className={CARD_WIDTH}>
                      {card(video)}
                    </div>
                  ))}
                </ScrollRow>
              </div>
            </section>
          )}
          {sections.map((s) => (
            <section key={s.topic} className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold text-ink md:text-2xl">{s.topic}</h2>
                <button
                  type="button"
                  onClick={() => setTopic(s.topic)}
                  className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
                >
                  See all {s.items.length}
                  <Icon name="chevronRight" className="size-4" />
                </button>
              </div>
              <div className="mt-3">
                <ScrollRow label={`${s.topic} videos`}>
                  {s.items.map((video) => (
                    <div key={video.videoId} className={CARD_WIDTH}>
                      {card(video)}
                    </div>
                  ))}
                </ScrollRow>
              </div>
            </section>
          ))}
          {sections.length === 0 && <p className="mt-10 text-center text-muted">No videos match these filters.</p>}
        </>
      )}
    </>
  );
}
