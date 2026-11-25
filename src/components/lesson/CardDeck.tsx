"use client";

import { useState, type ReactNode } from "react";
import { FocusScreen, FocusSummary } from "./FocusScreen";

interface CardDeckProps {
  title: string;
  cards: ReactNode[];
  onClose: () => void;
  // When the last card is passed.
  onDone: () => void;
  summaryTitle: string;
  summaryDetail?: string;
  // Extra buttons on the summary.
  finish?: ReactNode;
  // Sheets that must show above the deck (a word's meaning, a sentence playing).
  children?: ReactNode;
}

// Cards one at a time on a focus screen, with Back and Next, then a short summary.
export function CardDeck({ title, cards, onClose, onDone, summaryTitle, summaryDetail, finish, children }: CardDeckProps) {
  const [index, setIndex] = useState(0);
  const isFinished = index >= cards.length;

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex >= cards.length) onDone();
  };

  const footer = isFinished ? null : (
    <div className="flex gap-3">
      <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0} className="btn-3d flex-1 py-3 disabled:opacity-40">
        Back
      </button>
      <button type="button" onClick={next} className="btn-3d btn-brand flex-[2] py-3">
        {index + 1 === cards.length ? "Finish" : "Next"}
      </button>
    </div>
  );

  return (
    <FocusScreen title={title} progress={index / cards.length} onClose={onClose} footer={footer}>
      {isFinished ? (
        <FocusSummary title={summaryTitle} detail={summaryDetail}>
          {finish}
          <button type="button" onClick={() => setIndex(0)} className="btn-3d py-3">
            Go through them again
          </button>
          <button type="button" onClick={onClose} className="btn-3d py-3">
            Back to the day
          </button>
        </FocusSummary>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            {title} · {index + 1} of {cards.length}
          </p>
          <div key={index} className="mt-3 animate-fade-in">
            {cards[index]}
          </div>
        </>
      )}
      {children}
    </FocusScreen>
  );
}
