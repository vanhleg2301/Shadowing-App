"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { ScrollRow } from "@/components/ScrollRow";
import { LEVEL_DOT, VideoCard } from "@/components/VideoCard";
import { LEVELS, TOPICS, type CuratedVideo, type Level, type Topic } from "@/data/curated";

interface VideoLibraryProps {
  videos: CuratedVideo[];
  favoriteIds: string[];
}

export function VideoLibrary({ videos, favoriteIds }: VideoLibraryProps) {
  const [level, setLevel] = useState<Level | "all">("all");
  const [topic, setTopic] = useState<Topic | null>(null);

  const byLevel = videos.filter((v) => level === "all" || v.level === level);
  const sections = TOPICS.map((t) => ({ topic: t, items: byLevel.filter((v) => v.topic === t) })).filter(
    (s) => s.items.length > 0,
  );
  const selected = topic ? byLevel.filter((v) => v.topic === topic) : [];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Level" className="flex rounded-2xl border border-line bg-white p-1">
          {(["all", ...LEVELS] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={level === l}
              onClick={() => setLevel(l)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                level === l ? "bg-ink text-white shadow-[0_2px_0_0_#000]" : "text-muted hover:text-ink"
              }`}
            >
              {l !== "all" && <span className={`size-2 rounded-full ${LEVEL_DOT[l]}`} />}
              {l === "all" ? "All levels" : l}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
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
            <span className={`text-xs ${topic === s.topic ? "text-white/70" : "text-muted"}`}>{s.items.length}</span>
          </button>
        ))}
      </div>

      {topic ? (
        <section className="mt-6">
          <h2 className="text-2xl font-extrabold text-ink">{topic}</h2>
          <div key={`${topic}-${level}`} className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {selected.map((video) => (
              <VideoCard key={video.videoId} video={video} isFavorite={favoriteIds.includes(video.videoId)} />
            ))}
          </div>
          {selected.length === 0 && <p className="mt-6 text-muted">No videos at this level yet.</p>}
        </section>
      ) : (
        sections.map((s) => (
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
                  <div key={video.videoId} className="w-[78%] shrink-0 snap-start sm:w-[45%] xl:w-[31%]">
                    <VideoCard video={video} isFavorite={favoriteIds.includes(video.videoId)} />
                  </div>
                ))}
              </ScrollRow>
            </div>
          </section>
        ))
      )}

      {sections.length === 0 && <p className="mt-10 text-center text-muted">No videos match these filters.</p>}
    </>
  );
}
