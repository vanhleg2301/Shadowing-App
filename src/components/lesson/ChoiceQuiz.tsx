"use client";

import Image from "next/image";
import { useState } from "react";
import { getPassScore } from "@/lib/day-test";
import { speak } from "@/lib/speech";
import { FocusScreen, FocusSummary } from "./FocusScreen";

export interface ChoiceQuestion {
  // Small heading above the question, e.g. "The situation".
  label: string;
  prompt: string;
  image?: string;
  options: string[];
  answer: string;
}

interface ChoiceQuizProps {
  title: string;
  questions: ChoiceQuestion[];
  onClose: () => void;
  onPass: () => void;
}

// Multiple choice on a focus screen: choose, check, see right away whether it was right, continue.
export function ChoiceQuiz({ title, questions, onClose, onPass }: ChoiceQuizProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const isFinished = index >= questions.length;
  const question = questions[index];
  const passScore = getPassScore(questions.length);
  const isRight = picked === question?.answer;

  const check = () => {
    if (!picked) return;
    setIsChecked(true);
    if (isRight) setScore((s) => s + 1);
    speak(question.answer, "us", 0.9);
  };

  const next = () => {
    const nextIndex = index + 1;
    setPicked(null);
    setIsChecked(false);
    setIndex(nextIndex);
    if (nextIndex >= questions.length && score >= passScore) onPass();
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setIsChecked(false);
    setScore(0);
  };

  const footer = isFinished ? null : isChecked ? (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className={`font-extrabold ${isRight ? "text-brand" : "text-red-600"}`}>{isRight ? "Correct!" : "Not quite"}</p>
        {!isRight && (
          <p lang="en" className="text-sm text-ink">
            Answer: <b>{question.answer}</b>
          </p>
        )}
      </div>
      <button type="button" onClick={next} className={`btn-3d shrink-0 px-6 py-3 ${isRight ? "btn-brand" : ""}`}>
        Continue
      </button>
    </div>
  ) : (
    <button type="button" onClick={check} disabled={!picked} className="btn-3d btn-brand w-full py-3">
      Check
    </button>
  );

  return (
    <FocusScreen title={title} progress={(index + (isChecked ? 1 : 0)) / questions.length} onClose={onClose} footer={footer}>
      {isFinished ? (
        <FocusSummary
          title={`${score}/${questions.length}`}
          detail={score >= passScore ? "Passed! This part is done." : `You need ${passScore} to pass. Try once more.`}
          isPassed={score >= passScore}
        >
          {score >= passScore ? (
            <button type="button" onClick={onClose} className="btn-3d btn-brand py-3">
              Back to the lesson
            </button>
          ) : (
            <>
              <button type="button" onClick={restart} className="btn-3d btn-brand py-3">
                Try again
              </button>
              <button type="button" onClick={onClose} className="btn-3d py-3">
                Back to the lesson
              </button>
            </>
          )}
        </FocusSummary>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">{question.label}</p>
          {question.image && (
            <Image src={question.image} alt="" width={320} height={320} className="mx-auto mt-3 aspect-square w-full max-w-64 rounded-3xl border border-line" />
          )}
          <p lang="en" className="mt-3 text-xl font-extrabold leading-snug text-ink">
            {question.prompt}
          </p>
          <ul lang="en" className="mt-5 space-y-2.5">
            {question.options.map((option) => {
              const state = !isChecked
                ? option === picked
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-brand"
                : option === question.answer
                  ? "border-brand bg-brand-soft"
                  : option === picked
                    ? "border-red-400 bg-red-50 dark:bg-red-950/40"
                    : "border-line bg-surface opacity-50";
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => setPicked(option)}
                    disabled={isChecked}
                    aria-pressed={option === picked}
                    className={`min-h-14 w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold text-ink shadow-[0_3px_0_0_var(--color-line)] transition-colors ${state}`}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </FocusScreen>
  );
}
