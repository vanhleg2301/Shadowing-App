"use client";

import { useState, type KeyboardEvent } from "react";
import { PracticeNav } from "@/components/PracticeNav";
import type { Sentence } from "@/lib/lesson";
import { checkDictation, type WordResult } from "@/lib/practice";

interface DictationPanelProps {
  sentence: Sentence;
  index: number;
  total: number;
  onListen: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReveal: () => void;
}

export function DictationPanel({ sentence, index, total, onListen, onPrev, onNext, onReveal }: DictationPanelProps) {
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ words: WordResult[]; score: number } | null>(null);

  const handleCheck = () => {
    setResult(checkDictation(sentence.text, typed));
    onReveal();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleCheck();
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold text-muted">
        Sentence {index + 1}/{total} · Listen and type what you hear
      </p>
      <textarea
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        autoFocus
        spellCheck={false}
        autoCapitalize="off"
        placeholder="Type the sentence, then press Enter"
        className="mt-2 w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-lg text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />

      {result && (
        <div className="mt-2 rounded-2xl bg-cream p-3">
          <p className={`text-sm font-bold ${result.score === 100 ? "text-brand" : "text-amber-700"}`}>
            {result.score === 100 ? "Perfect!" : `${result.score}% correct`}
          </p>
          <p className="mt-1 text-lg leading-relaxed">
            {result.words.map((w, i) => (
              <span
                key={i}
                className={w.isCorrect ? "text-brand" : "rounded bg-red-100 px-0.5 text-red-700 underline decoration-wavy"}
              >
                {w.text}{" "}
              </span>
            ))}
          </p>
        </div>
      )}

      <PracticeNav index={index} total={total} onPrev={onPrev} onNext={onNext} onListen={onListen}>
        <button type="button" className="btn-3d btn-brand py-3 text-sm" onClick={handleCheck}>
          Check
        </button>
      </PracticeNav>
    </div>
  );
}
