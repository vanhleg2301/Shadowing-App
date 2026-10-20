"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setSavedWord } from "@/app/actions";
import type { SavedWord } from "@/lib/user-data";
import { speak, type Accent } from "@/lib/speech";

interface SavedWordCardProps {
  item: SavedWord;
}

const ACCENTS: Accent[] = ["uk", "us"];

export function SavedWordCard({ item }: SavedWordCardProps) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { entry } = item;
  const meaning = entry?.contextMeaning ?? entry?.meanings[0]?.definition;

  if (isRemoved) return null;

  const handleRemove = () => {
    setIsRemoved(true);
    startTransition(async () => {
      const result = await setSavedWord({ word: item.word, sentence: "", videoId: null, entry: null, isSaved: false });
      if (!result.ok) setIsRemoved(false);
    });
  };

  return (
    <li lang="en" className="rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_0_0_var(--color-line)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xl font-extrabold text-ink">{item.word}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {ACCENTS.map((accent) => {
              const ipa = accent === "uk" ? entry?.ipaUk : entry?.ipaUs;
              return (
                <button
                  key={accent}
                  type="button"
                  onClick={() => speak(item.word, accent)}
                  aria-label={`Listen in ${accent.toUpperCase()} English`}
                  className="rounded-lg bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-dark hover:bg-brand/20"
                >
                  {accent.toUpperCase()}
                  {ipa && <span className="font-normal"> /{ipa}/</span>}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-cream hover:text-red-600"
        >
          Remove
        </button>
      </div>
      {meaning && <p className="mt-3 text-ink">{meaning}</p>}
      {item.sentence && <p className="mt-2 rounded-2xl bg-cream p-3 text-sm italic text-muted">“{item.sentence}”</p>}
      {item.videoId && (
        <Link href={`/watch/${item.videoId}`} className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-dark">
          Open the video →
        </Link>
      )}
    </li>
  );
}
