"use client";

import { useState, type KeyboardEvent } from "react";
import { PracticeNav } from "@/components/PracticeNav";
import type { Sentence } from "@/lib/lesson";
import { normalizeToken, pickClozeIndexes, tokenize } from "@/lib/practice";

interface ClozePanelProps {
  sentence: Sentence;
  index: number;
  total: number;
  onListen: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReveal: () => void;
}

export function ClozePanel({ sentence, index, total, onListen, onPrev, onNext, onReveal }: ClozePanelProps) {
  const tokens = tokenize(sentence.text);
  const blanks = pickClozeIndexes(tokens);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isChecked, setIsChecked] = useState(false);

  const isCorrect = (i: number) => normalizeToken(answers[i] ?? "") === tokens[i].norm;
  const correctCount = blanks.filter(isCorrect).length;

  const handleCheck = () => {
    setIsChecked(true);
    onReveal();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleCheck();
  };

  return (
    <div>
      <p className="text-xs font-semibold text-muted">
        Sentence {index + 1}/{total} · Fill in the missing words
      </p>

      {blanks.length === 0 ? (
        <p className="mt-2 text-lg text-ink">{sentence.text}</p>
      ) : (
        <p className="mt-2 text-lg leading-[2.4] text-ink">
          {tokens.map((token, i) => {
            if (!blanks.includes(i)) return <span key={i}>{token.text} </span>;
            if (isChecked && !isCorrect(i)) {
              return (
                <span key={i}>
                  <span className="rounded bg-red-100 px-1 text-red-700 dark:bg-red-500/20 dark:text-red-300 line-through">{answers[i] || "—"}</span>{" "}
                  <span className="font-semibold text-brand">{token.text}</span>{" "}
                </span>
              );
            }
            return (
              <span key={i}>
                <input
                  value={answers[i] ?? ""}
                  onChange={(event) => setAnswers({ ...answers, [i]: event.target.value })}
                  onKeyDown={handleKeyDown}
                  readOnly={isChecked}
                  autoFocus={i === blanks[0]}
                  spellCheck={false}
                  autoCapitalize="off"
                  aria-label={`Missing word ${blanks.indexOf(i) + 1}`}
                  style={{ width: `${Math.max(token.text.length, 3) + 1.5}ch` }}
                  className={`rounded-lg border-b-2 bg-surface px-1 text-center outline-none ${
                    isChecked ? "border-brand font-semibold text-brand" : "border-brand/50 focus:border-brand"
                  }`}
                />{" "}
              </span>
            );
          })}
        </p>
      )}

      {isChecked && blanks.length > 0 && (
        <p className={`mt-1 animate-fade-in text-sm font-bold ${correctCount === blanks.length ? "text-brand" : "text-amber-700"}`}>
          {correctCount === blanks.length ? "All correct!" : `${correctCount}/${blanks.length} correct`}
        </p>
      )}

      <PracticeNav index={index} total={total} onPrev={onPrev} onNext={onNext} onListen={onListen}>
        <button type="button" className="btn-3d btn-brand py-3 text-sm" onClick={handleCheck} disabled={isChecked}>
          Check
        </button>
      </PracticeNav>
    </div>
  );
}
