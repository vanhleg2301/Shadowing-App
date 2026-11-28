"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectCollection, setCourseMode } from "@/app/actions";
import { Icon } from "@/components/Icon";
import type { CollectionId } from "@/data/collections";
import type { CourseMode } from "@/lib/course-mode";
import { LEVEL_CHECK_QUESTIONS } from "@/data/level-check";
import { useLinePlayer } from "@/hooks/useLinePlayer";
import type { LineNarration } from "@/lib/story-audio";

interface Result {
  mode: CourseMode;
  collection: CollectionId | null;
  title: string;
  detail: string;
}

function getResult(score: number): Result {
  if (score <= 2) {
    return {
      mode: "gentle",
      collection: "sponge",
      title: "Start with the Gentle plan and slow videos",
      detail: "English Sponge speaks slowly and clearly. Take two real days for each course day if it feels like a lot.",
    };
  }
  if (score <= 4) {
    return {
      mode: "gentle",
      collection: "super-easy",
      title: "Gentle plan with medium-speed videos",
      detail: "You follow simple English well. Super Easy English gives you everyday conversations at a comfortable speed.",
    };
  }
  return {
    mode: "full",
    collection: null,
    title: "You're ready for the full course",
    detail: "Go for the full plan with your current videos. When it feels easy, try a natural-speed collection.",
  };
}

// narration: the app's Kokoro sentences (src/data/app-narration.ts), in the voice of the daily stories.
export function LevelCheck({ narration }: { narration: LineNarration | null }) {
  const router = useRouter();
  const { playText, audioProps } = useLinePlayer(narration);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  if (index >= LEVEL_CHECK_QUESTIONS.length) {
    const result = getResult(score);
    const handleApply = () =>
      startTransition(async () => {
        await setCourseMode({ mode: result.mode });
        if (result.collection) await selectCollection({ collection: result.collection });
        router.push("/course");
      });
    return (
      <section className="animate-fade-up rounded-3xl border border-line bg-surface p-5 text-center">
        <p className="text-sm font-semibold text-muted">
          {score}/{LEVEL_CHECK_QUESTIONS.length} right
        </p>
        <p className="mt-1 text-2xl font-extrabold text-ink">{result.title}</p>
        <p className="mt-2 text-muted">{result.detail}</p>
        <button type="button" onClick={handleApply} disabled={isPending} className="btn-3d btn-brand mt-5 px-5 py-2.5">
          {isPending ? "Saving..." : "Use this plan"}
        </button>
      </section>
    );
  }

  const question = LEVEL_CHECK_QUESTIONS[index];
  const handlePick = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === question.answer) setScore(score + 1);
  };
  const handleNext = () => {
    setPicked(null);
    setIndex(index + 1);
  };

  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <audio {...audioProps} />
      <p className="text-xs font-bold uppercase tracking-wide text-accent">
        Question {index + 1} of {LEVEL_CHECK_QUESTIONS.length}
      </p>
      <button
        type="button"
        onClick={() => playText(question.sentence, undefined, question.rate)}
        className="btn-3d mt-4 flex w-full items-center justify-center gap-2 py-4 text-lg font-bold"
      >
        <Icon name="volume" className="size-6" />
        Listen
      </button>
      <p className="mt-2 text-center text-xs text-muted">You can listen twice.</p>
      <p className="mt-5 font-bold text-ink">{question.question}</p>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {question.options.map((option, i) => {
          const state = picked === null ? "" : i === question.answer ? "border-brand bg-brand-soft" : i === picked ? "border-red-400 opacity-70" : "opacity-60";
          return (
            <button
              key={option}
              type="button"
              onClick={() => handlePick(i)}
              disabled={picked !== null}
              className={`rounded-2xl border border-line bg-cream px-4 py-3 text-left font-semibold text-ink ${state}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4">
          <p className="text-sm text-muted">
            You heard: <span className="italic text-ink">“{question.sentence}”</span>
          </p>
          <button type="button" onClick={handleNext} className="btn-3d btn-brand mt-3 w-full py-2.5">
            {index + 1 < LEVEL_CHECK_QUESTIONS.length ? "Next" : "See my plan"}
          </button>
        </div>
      )}
    </section>
  );
}
