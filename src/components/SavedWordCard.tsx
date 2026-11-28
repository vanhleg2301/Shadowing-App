"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { setSavedWord } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { SavedWord } from "@/lib/user-data";
import { Icon } from "@/components/Icon";
import { speak } from "@/lib/speech";

interface SavedWordCardProps {
  item: SavedWord;
}


export function SavedWordCard({ item }: SavedWordCardProps) {
  const [isRemoved, setIsRemoved] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { entry } = item;
  const meaning = entry?.contextMeaning ?? entry?.meanings[0]?.definition;

  if (isRemoved) return null;

  const handleRemove = () => {
    setIsAsking(false);
    setIsRemoved(true);
    startTransition(async () => {
      const result = await setSavedWord({ word: item.word, sentence: "", videoId: null, entry: null, isSaved: false });
      if (!result.ok) setIsRemoved(false);
    });
  };

  return (
    <li lang="en" className="rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_0_0_var(--color-line)]">
      <div className="flex items-start justify-between gap-3">
        {entry?.image && <Image src={entry.image} alt="" width={160} height={160} className="size-16 shrink-0 rounded-xl border border-line" />}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold text-ink">{item.word}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => speak(item.word)}
              aria-label={`Listen to "${item.word}"`}
              className="flex min-h-9 items-center gap-1.5 rounded-lg bg-brand-soft px-2.5 text-xs font-semibold text-brand-dark hover:bg-brand/20"
            >
              <Icon name="volume" className="size-4" />
              {(entry?.ipaUs ?? entry?.ipaUk) && <span className="font-normal">/{entry?.ipaUs ?? entry?.ipaUk}/</span>}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAsking(true)}
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
      {isAsking && (
        <ConfirmDialog
          title={`Remove "${item.word}"?`}
          message="It disappears from My words and from your review flashcards."
          confirmLabel="Remove"
          tone="danger"
          onConfirm={handleRemove}
          onCancel={() => setIsAsking(false)}
        />
      )}
    </li>
  );
}
