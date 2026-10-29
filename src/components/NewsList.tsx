"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getThumbnailUrl } from "@/lib/media";

export interface NewsStory {
  videoId: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  dateLabel: string | null;
}

interface NewsListProps {
  stories: NewsStory[];
}

export function NewsList({ stories }: NewsListProps) {
  const categories = [...new Set(stories.map((s) => s.category))];
  const [category, setCategory] = useState<string | null>(null);
  const visible = category ? stories.filter((s) => s.category === category) : stories;
  const [lead, ...rest] = visible;

  return (
    <>
      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {[null, ...categories].map((c) => (
          <button
            key={c ?? "all"}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              category === c ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-ink"
            }`}
          >
            {c ?? "All"}
          </button>
        ))}
      </div>

      {lead && (
        <Link href={`/news/${lead.videoId}`} className="group mt-5 block overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="relative aspect-video bg-cream">
            <Image src={getThumbnailUrl(lead.videoId)} alt="" fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
          </div>
          <div className="p-4">
            <StoryMeta story={lead} />
            <p className="mt-1 text-xl font-extrabold leading-snug text-ink group-hover:text-brand">{lead.title}</p>
          </div>
        </Link>
      )}

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {rest.map((story) => (
          <li key={story.videoId}>
            <Link href={`/news/${story.videoId}`} className="group flex gap-3 rounded-2xl border border-line bg-surface p-2.5">
              <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-cream">
                <Image src={getThumbnailUrl(story.videoId)} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <StoryMeta story={story} />
                <p className="mt-1 line-clamp-3 font-bold leading-snug text-ink group-hover:text-brand">{story.title}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function StoryMeta({ story }: { story: NewsStory }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-accent">
      {story.category}
      <span className="font-semibold normal-case text-muted">
        {story.dateLabel ? ` · ${story.dateLabel}` : ""} · {story.duration}
      </span>
    </p>
  );
}
