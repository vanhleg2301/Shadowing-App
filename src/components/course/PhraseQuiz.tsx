"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import type { CoursePhrase } from "@/data/course-a2";
import { speak } from "@/lib/speech";

interface PhraseQuizProps {
  phrases: CoursePhrase[];
  seed: number;
  onPass: () => void;
}

interface Question {
  prompt: string;
  hint: string;
  answer: string;
  options: string[];
}

const QUESTION_COUNT = 10;
const PASS_SCORE = 8;
// Shorter quizzes (the Gentle plan has 8 phrases) also allow two mistakes.
const getPassScore = (count: number) => Math.min(PASS_SCORE, count - 2);
const BLANK = "_____";

// Seeded shuffle so the server and the browser render the same quiz.
function shuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 9301 + 49297) % 233280;
    const j = Math.floor((state / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuestions(phrases: CoursePhrase[], seed: number): Question[] {
  return shuffle(phrases, seed)
    .slice(0, QUESTION_COUNT)
    .map((p, i) => {
      const distractors = shuffle(
        phrases.filter((other) => other.text !== p.text),
        seed + i + 1,
      ).slice(0, 3);
      const options = shuffle([p, ...distractors], seed + i + 100).map((o) => o.text);
      const index = p.example.toLowerCase().indexOf(p.text.toLowerCase());
      if (i % 2 === 0 && index >= 0) {
        const prompt = p.example.slice(0, index) + BLANK + p.example.slice(index + p.text.length);
        return { prompt, hint: "Complete the sentence.", answer: p.text, options };
      }
      return { prompt: p.meaning, hint: "Which phrase means this?", answer: p.text, options };
    });
}

export function PhraseQuiz({ phrases, seed, onPass }: PhraseQuizProps) {
  const questions = useMemo(() => buildQuestions(phrases, seed), [phrases, seed]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const isFinished = index >= questions.length;
  const question = questions[index];

  const handlePick = (option: string) => {
    if (picked) return;
    setPicked(option);
    if (option === question.answer) setScore((s) => s + 1);
    speak(question.prompt.includes(BLANK) ? question.prompt.replace(BLANK, question.answer) : question.answer, "uk");
  };

  const handleNext = () => {
    const next = index + 1;
    setPicked(null);
    setIndex(next);
    if (next >= questions.length && score >= getPassScore(questions.length)) onPass();
  };

  const handleRestart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  if (isFinished) {
    const hasPassed = score >= getPassScore(questions.length);
    return (
      <div className="rounded-2xl border border-line bg-cream p-5 text-center">
        <p className="text-3xl font-extrabold text-ink">
          {score}/{questions.length}
        </p>
        <p className={`mt-1 font-semibold ${hasPassed ? "text-brand" : "text-muted"}`}>
          {hasPassed ? "Great job! Quiz block done." : `You need ${getPassScore(questions.length)} to pass. Look at the phrases again and retry.`}
        </p>
        <button type="button" onClick={handleRestart} className="btn-3d mt-4 px-4 py-2 text-sm">
          <Icon name="repeat" className="size-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-muted">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>Score {score}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent">{question.hint}</p>
      <p lang="en" className="mt-1 text-lg font-bold leading-snug text-ink">
        {question.prompt}
      </p>
      <ul lang="en" className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => {
          const isAnswer = option === question.answer;
          const state = !picked ? "border-line bg-surface hover:border-brand" : isAnswer ? "border-brand bg-brand-soft" : option === picked ? "border-red-400 bg-red-50 dark:bg-red-950/40" : "border-line bg-surface opacity-60";
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => handlePick(option)}
                disabled={picked !== null}
                className={`min-h-12 w-full rounded-xl border-2 px-3 py-2 text-left font-semibold text-ink transition-colors ${state}`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className={`font-semibold ${picked === question.answer ? "text-brand" : "text-red-600"}`}>
            {picked === question.answer ? "Correct!" : `Answer: ${question.answer}`}
          </p>
          <button type="button" onClick={handleNext} className="btn-3d btn-brand px-4 py-2 text-sm">
            {index + 1 === questions.length ? "See score" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
