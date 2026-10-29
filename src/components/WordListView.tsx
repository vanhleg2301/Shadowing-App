"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { SavedWordCard } from "@/components/SavedWordCard";
import { ShowMore } from "@/components/ShowMore";
import type { SavedWord } from "@/lib/user-data";

interface WordListViewProps {
  words: SavedWord[];
  masteredInterval: number;
  // Titles of the lessons the words were saved from, for the "By lesson" view.
  lessonTitles: Record<string, string>;
}

type Filter = "all" | "learning" | "mastered" | "videos" | "course";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "learning", label: "Learning" },
  { id: "mastered", label: "Mastered" },
  { id: "videos", label: "From videos" },
  { id: "course", label: "Course phrases" },
];

function getMeaning(word: SavedWord): string {
  return word.entry?.contextMeaning ?? word.entry?.meanings[0]?.definition ?? "";
}

function toCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

// Front = word, back = meaning + example sentence; imports straight into Anki or Quizlet.
function downloadCsv(words: SavedWord[]) {
  const rows = words.map((w) => [w.word, `${getMeaning(w)}${w.sentence ? `<br><i>${w.sentence}</i>` : ""}`].map(toCsvCell).join(","));
  const blob = new Blob([`﻿${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-words.csv";
  link.click();
  URL.revokeObjectURL(url);
}

interface WordGroup {
  videoId: string | null;
  title: string;
  words: SavedWord[];
}

// Words grouped by the lesson they were saved from, newest lesson first (words arrive newest first);
// course phrases and words without a lesson share one group at the end.
function groupByLesson(words: SavedWord[], lessonTitles: Record<string, string>): WordGroup[] {
  const groups = new Map<string, WordGroup>();
  for (const word of words) {
    const key = word.videoId ?? "";
    const group = groups.get(key) ?? {
      videoId: word.videoId,
      title: word.videoId ? (lessonTitles[word.videoId] ?? "A video you pasted") : "Course phrases and other words",
      words: [],
    };
    group.words.push(word);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => Number(a.videoId === null) - Number(b.videoId === null));
}

export function WordListView({ words, masteredInterval, lessonTitles }: WordListViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [isGrouped, setIsGrouped] = useState(true);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const visible = words.filter((w) => {
    const isMastered = w.intervalDays >= masteredInterval;
    const matchesFilter =
      filter === "all" ||
      (filter === "learning" && !isMastered) ||
      (filter === "mastered" && isMastered) ||
      (filter === "videos" && w.videoId !== null) ||
      (filter === "course" && w.videoId === null);
    return matchesFilter && (!needle || w.word.toLowerCase().includes(needle) || getMeaning(w).toLowerCase().includes(needle));
  });

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 sm:max-w-xs">
          <span className="sr-only">Search your words</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words or meanings"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-ink placeholder:text-muted"
          />
        </label>
        <div role="radiogroup" aria-label="Layout" className="flex rounded-xl border border-line bg-surface p-0.5">
          {[
            { value: true, label: "By lesson" },
            { value: false, label: "All words" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={isGrouped === option.value}
              onClick={() => setIsGrouped(option.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${isGrouped === option.value ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => downloadCsv(visible)} disabled={visible.length === 0} className="btn-3d px-4 py-2 text-sm">
          Export CSV (Anki)
        </button>
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Filter words">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
              filter === f.id ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-ink hover:border-brand"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-muted">
        {visible.length} of {words.length} words
      </p>
      {visible.length === 0 ? (
        <p className="mt-4 text-muted">No words match.</p>
      ) : isGrouped ? (
        <div className="mt-3 space-y-3">
          {groupByLesson(visible, lessonTitles).map((group, i) => (
            <details key={group.videoId ?? "other"} open={i === 0} className="group rounded-3xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-ink">{group.title}</span>
                  <span className="text-sm text-muted">
                    {group.words.length} {group.words.length === 1 ? "word" : "words"}
                  </span>
                </span>
                {group.videoId && (
                  <Link href={`/watch/${group.videoId}`} className="shrink-0 text-sm font-semibold text-brand hover:text-brand-dark">
                    Open lesson
                  </Link>
                )}
                <Icon name="chevronDown" className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <ShowMore as="ul" resetKey={`${filter}-${query}`} className="grid grid-cols-1 gap-4 px-4 pb-4 md:grid-cols-2 xl:grid-cols-3">
                {group.words.map((w) => (
                  <SavedWordCard key={w.word} item={w} />
                ))}
              </ShowMore>
            </details>
          ))}
        </div>
      ) : (
        <ShowMore as="ul" resetKey={`${filter}-${query}`} className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((w) => (
            <SavedWordCard key={w.word} item={w} />
          ))}
        </ShowMore>
      )}
    </>
  );
}
