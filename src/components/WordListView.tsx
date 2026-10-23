"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { SavedWordCard } from "@/components/SavedWordCard";
import type { SavedWord } from "@/lib/user-data";

interface WordListViewProps {
  words: SavedWord[];
  masteredInterval: number;
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

export function WordListView({ words, masteredInterval }: WordListViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
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
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((w) => (
            <SavedWordCard key={w.word} item={w} />
          ))}
        </ul>
      )}
    </>
  );
}
