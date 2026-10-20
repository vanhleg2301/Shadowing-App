"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { gradeWord } from "@/app/actions";
import { speak, type Accent } from "@/lib/speech";
import { formatDelay, schedule, type Grade } from "@/lib/srs";
import type { ReviewCard } from "@/lib/user-data";

interface ReviewSessionProps {
  cards: ReviewCard[];
}

const GRADES: { grade: Grade; label: string; className: string }[] = [
  { grade: "again", label: "Again", className: "border-red-700 bg-red-600 text-white shadow-[0_3px_0_0_#b91c1c]" },
  { grade: "hard", label: "Hard", className: "" },
  { grade: "good", label: "Good", className: "btn-brand" },
  { grade: "easy", label: "Easy", className: "border-sky-700 bg-sky-600 text-white shadow-[0_3px_0_0_#0369a1]" },
];

const ACCENTS: Accent[] = ["uk", "us"];

function blankOut(sentence: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sentence.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "_____");
}

export function ReviewSession({ cards }: ReviewSessionProps) {
  // "Again" cards go back to the end of today's queue, like Anki's learning step.
  const [queue, setQueue] = useState(cards);
  const [isRevealed, setIsRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const card = queue[0];
  if (!card) {
    return (
      <div className="mt-8 max-w-xl animate-fade-up rounded-3xl border border-line bg-surface p-8 text-center shadow-[0_4px_0_0_var(--color-line)]">
        <p className="text-2xl font-extrabold text-ink">All done for now!</p>
        <p className="mt-2 text-muted">
          {reviewedCount > 0 ? `You reviewed ${reviewedCount} cards.` : "No words are due."} Come back later for the next ones.
        </p>
        <Link href="/" className="btn-3d btn-brand mt-6 px-5 py-2.5">
          Watch a video
        </Link>
      </div>
    );
  }

  const now = new Date();
  const meaning = card.entry?.contextMeaning ?? card.entry?.meanings[0]?.definition;

  const handleGrade = (grade: Grade) => {
    setHasError(false);
    startTransition(async () => {
      const result = await gradeWord({ word: card.word, grade });
      if (!result.ok) {
        setHasError(true);
        return;
      }
      setReviewedCount((n) => n + 1);
      setIsRevealed(false);
      setQueue((q) => (grade === "again" ? [...q.slice(1), card] : q.slice(1)));
    });
  };

  return (
    <div className="mt-8 max-w-xl">
      <p className="text-sm font-semibold text-muted">{queue.length} left in this session</p>
      <div
        key={`${card.word}-${reviewedCount}`}
        lang="en"
        className="mt-2 animate-fade-up rounded-3xl border border-line bg-surface p-6 shadow-[0_4px_0_0_var(--color-line)]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-3xl font-extrabold text-ink">{card.word}</p>
          {ACCENTS.map((accent) => {
            const ipa = accent === "uk" ? card.entry?.ipaUk : card.entry?.ipaUs;
            return (
              <button
                key={accent}
                type="button"
                onClick={() => speak(card.word, accent)}
                className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-dark hover:bg-brand/20"
              >
                {accent.toUpperCase()}
                {ipa && <span className="font-normal"> /{ipa}/</span>}
              </button>
            );
          })}
        </div>

        {card.sentence && (
          <p className="mt-4 rounded-2xl bg-cream p-3 italic text-muted">
            “{isRevealed ? card.sentence : blankOut(card.sentence, card.word)}”
          </p>
        )}

        {isRevealed ? (
          <div className="mt-4 animate-fade-in">
            {meaning && <p className="text-lg font-semibold text-brand">{meaning}</p>}
            {card.entry?.meanings.slice(0, 2).map((m, i) => (
              <p key={i} className="mt-2 text-sm text-ink">
                <span className="font-semibold text-muted">{m.partOfSpeech}.</span> {m.definition}
              </p>
            ))}
            {card.videoId && (
              <Link href={`/watch/${card.videoId}`} className="mt-3 inline-block text-sm font-semibold text-brand">
                Open the video →
              </Link>
            )}
          </div>
        ) : (
          <p className="mt-4 text-muted">Do you remember what it means?</p>
        )}
      </div>

      {hasError && <p className="mt-3 text-sm text-red-600">Couldn&apos;t save your answer. Please try again.</p>}

      {isRevealed ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GRADES.map(({ grade, label, className }) => (
            <button
              key={grade}
              type="button"
              disabled={isPending}
              onClick={() => handleGrade(grade)}
              className={`btn-3d flex-col gap-0 py-2.5 text-sm ${className}`}
            >
              {label}
              <span className="text-[11px] font-medium opacity-80">
                {formatDelay(now, schedule(card, grade, now).dueAt)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" onClick={() => setIsRevealed(true)} className="btn-3d btn-brand mt-4 w-full py-3">
          Show answer
        </button>
      )}
    </div>
  );
}
