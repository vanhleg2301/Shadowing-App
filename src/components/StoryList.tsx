"use client";

import Link from "next/link";
import type { StoryListItem } from "@/data/stories";
import { useReadStories } from "@/lib/story-progress";

interface StoryListProps {
  stories: StoryListItem[];
}

// Unread stories first; finished ones stay at the end, ticked, to read again.
export function StoryList({ stories }: StoryListProps) {
  const read = useReadStories();
  const readCount = stories.filter((s) => read.has(s.id)).length;
  const ordered = [...stories.filter((s) => !read.has(s.id)), ...stories.filter((s) => read.has(s.id))];

  return (
    <>
      {readCount > 0 && (
        <p className="mt-4 text-sm font-semibold text-muted">
          {readCount} of {stories.length} read
        </p>
      )}
      <ul className="stagger mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {ordered.map((story) => {
          const isRead = read.has(story.id);
          return (
            <li key={story.id}>
              <Link
                href={`/stories/${story.id}`}
                className={`pressable block h-full rounded-3xl border p-4 hover:border-brand ${
                  isRead ? "border-line bg-cream" : "border-line bg-surface"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-accent">{story.label}</p>
                  {isRead && <span className="shrink-0 text-xs font-bold text-brand">Read ✓</span>}
                </div>
                <p className={`mt-1 font-bold ${isRead ? "text-muted" : "text-ink"}`}>{story.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{story.summary}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
