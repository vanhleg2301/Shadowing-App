"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { Level } from "@/data/curated";
import { LEVEL_STORAGE_KEY, PLACEMENT_QUESTIONS, getPlacementLevel } from "@/data/placement";
import { speak } from "@/lib/speech";

const LEVEL_ADVICE: Record<Level, string> = {
  A1: "Start with A1 videos: slow, clear speech about everyday things.",
  A2: "A2 videos are your sweet spot. When you're ready to speak, try the 7-day course.",
  B1: "You're ready for B1 videos. Shadow them to sound more natural.",
};

export function PlacementTest() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const question = PLACEMENT_QUESTIONS[index];
  const isFinished = index >= PLACEMENT_QUESTIONS.length;

  const handleAnswer = (option: string) => {
    const next = [...answers, option];
    setAnswers(next);
    setIndex(index + 1);
    if (next.length === PLACEMENT_QUESTIONS.length) {
      try {
        localStorage.setItem(LEVEL_STORAGE_KEY, getLevel(next));
      } catch {
        // Private mode: the result is still shown.
      }
    }
  };

  if (isFinished) {
    const level = getLevel(answers);
    const score = answers.filter((a, i) => a === PLACEMENT_QUESTIONS[i].answer).length;
    return (
      <div className="animate-fade-up rounded-3xl border border-line bg-surface p-6 text-center">
        <p className="text-sm font-semibold text-muted">
          {score}/{PLACEMENT_QUESTIONS.length} correct · your level to study
        </p>
        <p className="mt-2 text-6xl font-extrabold text-brand">{level}</p>
        <p className="mx-auto mt-3 max-w-md text-ink">{LEVEL_ADVICE[level]}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-3d btn-brand px-5 py-2.5">
            Show {level} videos
          </Link>
          {level !== "A1" && (
            <Link href="/course" className="btn-3d px-5 py-2.5">
              7-day speaking course
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-sm font-semibold text-muted">
        <span>
          Question {index + 1} of {PLACEMENT_QUESTIONS.length}
        </span>
        <span>{question.listen ? "Listening" : "Grammar & words"}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(index / PLACEMENT_QUESTIONS.length) * 100}%` }} />
      </div>
      {question.listen && (
        <button type="button" onClick={() => speak(question.listen ?? "", "uk", 0.85)} className="btn-3d mt-5 px-4 py-2.5">
          <Icon name="volume" className="size-5" />
          Play the sentence
        </button>
      )}
      <p lang="en" className="mt-4 text-xl font-bold leading-snug text-ink">
        {question.prompt}
      </p>
      <ul lang="en" className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => (
          <li key={option}>
            <button
              type="button"
              onClick={() => handleAnswer(option)}
              className="min-h-12 w-full rounded-xl border-2 border-line bg-cream px-3 py-2 text-left font-semibold text-ink transition-colors hover:border-brand"
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => handleAnswer("")} className="mt-4 text-sm font-semibold text-muted hover:text-ink">
        I don&apos;t know
      </button>
    </div>
  );
}

function getLevel(answers: string[]): Level {
  const correct: Record<Level, number> = { A1: 0, A2: 0, B1: 0 };
  answers.forEach((a, i) => {
    const q = PLACEMENT_QUESTIONS[i];
    if (a === q.answer) correct[q.level]++;
  });
  return getPlacementLevel(correct);
}
