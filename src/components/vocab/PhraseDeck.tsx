"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { FocusScreen, FocusSummary } from "@/components/lesson/FocusScreen";
import { getPhrasePicture, type VocabTopic } from "@/data/vocabulary";
import { speak } from "@/lib/speech";

interface PhraseDeckProps {
  topic: VocabTopic;
  onClose: () => void;
  onDone: () => void;
  // Shown on the last screen, e.g. "Add all to Review".
  finish?: ReactNode;
}

const RATE = 0.85;

// The topic's phrases one card at a time: the phrases you say first, then the ones you hear.
export function PhraseDeck({ topic, onClose, onDone, finish }: PhraseDeckProps) {
  const cards = [...topic.phrases.filter((p) => !p.role), ...topic.phrases.filter((p) => p.role === "hear")];
  const hasHear = cards.some((p) => p.role === "hear");
  const [index, setIndex] = useState(0);
  const isFinished = index >= cards.length;
  const card = cards[index];

  // Each new card is read out once, the phrase then its example.
  useEffect(() => {
    if (card) speak(`${card.phrase}. ${card.example}`, "us", RATE);
  }, [card]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= cards.length) onDone();
  };

  const footer = isFinished ? null : (
    <div className="flex gap-2">
      {index > 0 && (
        <button type="button" onClick={() => setIndex(index - 1)} aria-label="Previous card" className="btn-3d shrink-0 px-4 py-3">
          <Icon name="chevronLeft" className="size-5" />
        </button>
      )}
      <button type="button" onClick={next} className="btn-3d btn-brand flex-1 py-3">
        {index + 1 === cards.length ? "Done" : "Next"}
      </button>
    </div>
  );

  return (
    <FocusScreen title="Learn the phrases" progress={index / cards.length} onClose={onClose} footer={footer}>
      {isFinished ? (
        <FocusSummary title={`${cards.length} ${topic.kind === "words" ? "words" : "phrases"}`} detail="You've met them all. Now check you know them.">
          {finish}
          <button type="button" onClick={onClose} className="btn-3d btn-brand py-3">
            Back to the lesson
          </button>
        </FocusSummary>
      ) : (
        <div lang="en" className="flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            {hasHear ? (card.role === "hear" ? "You'll hear" : "You say") : "New word"} · {index + 1} of {cards.length}
          </p>
          <Image
            key={card.phrase}
            src={getPhrasePicture(topic, card)}
            alt=""
            width={480}
            height={480}
            className="mt-3 aspect-square w-full max-w-72 animate-fade-in rounded-3xl border border-line"
          />
          <p className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-ink">{card.phrase}</p>
          <p className="mt-2 text-muted">{card.meaning}</p>
          <button
            type="button"
            onClick={() => speak(card.example, "us", RATE)}
            className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-ink hover:border-brand"
          >
            <Icon name="volume" className="size-5 shrink-0 text-brand" />
            <span className="italic">“{card.example}”</span>
          </button>
          <p className="mt-3 text-sm text-muted">Say it out loud after the voice.</p>
        </div>
      )}
    </FocusScreen>
  );
}
