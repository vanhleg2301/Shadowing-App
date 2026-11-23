"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { FocusScreen, FocusSummary } from "@/components/lesson/FocusScreen";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import type { SpeakTask } from "@/data/vocabulary";
import { speak } from "@/lib/speech";

interface SpeakSessionProps {
  tasks: SpeakTask[];
  onClose: () => void;
  onDone: () => void;
}

// "Your turn": one situation at a time; say it, then compare with an example answer.
export function SpeakSession({ tasks, onClose, onDone }: SpeakSessionProps) {
  const [index, setIndex] = useState(0);
  const [isShown, setIsShown] = useState(false);
  const isFinished = index >= tasks.length;
  const task = tasks[index];

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setIsShown(false);
    if (nextIndex >= tasks.length) onDone();
  };

  const footer = isFinished ? null : (
    <button type="button" onClick={next} className="btn-3d btn-brand w-full py-3">
      {index + 1 === tasks.length ? "Done" : "Next"}
    </button>
  );

  return (
    <FocusScreen title="Your turn" progress={index / tasks.length} onClose={onClose} footer={footer}>
      {isFinished ? (
        <FocusSummary title="Well done!" detail="Say them again tomorrow, without looking. That is how they stick.">
          <button type="button" onClick={onClose} className="btn-3d btn-brand py-3">
            Back to the lesson
          </button>
        </FocusSummary>
      ) : (
        <div lang="en">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            Situation {index + 1} of {tasks.length}
          </p>
          <p className="mt-2 text-2xl font-extrabold leading-snug text-ink">{task.situation}</p>
          <p className="mt-1 text-muted">What do you say? Tap the mic and say it out loud.</p>
          <div key={index} className="mt-6 rounded-3xl border border-line bg-surface p-4">
            <VoiceRecorder target={task.answer} recordLabel="Say it" />
          </div>
          {isShown ? (
            <button
              type="button"
              onClick={() => speak(task.answer, "us", 0.85)}
              className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-4 text-left"
            >
              <Icon name="volume" className="size-5 shrink-0 text-brand" />
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-brand">Example</span>
                <span className="font-semibold text-ink">{task.answer}</span>
              </span>
            </button>
          ) : (
            <button type="button" onClick={() => setIsShown(true)} className="mt-4 text-sm font-semibold text-brand hover:text-brand-dark">
              Show an example answer
            </button>
          )}
        </div>
      )}
    </FocusScreen>
  );
}
