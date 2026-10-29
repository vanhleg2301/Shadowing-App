"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { speak } from "@/lib/speech";

interface SpeakingPromptProps {
  index: number;
  prompt: string;
  // Gentle plan: a model answer to listen to and copy before answering in your own words.
  sampleAnswer?: string;
  onRecorded: () => void;
}

// One question to answer out loud; the recording stays on this device so the learner can listen back.
export function SpeakingPrompt({ index, prompt, sampleAnswer, onRecorded }: SpeakingPromptProps) {
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  return (
    <li className="rounded-2xl border border-line bg-cream p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{index + 1}</span>
        <p className="flex-1 font-semibold leading-snug text-ink">{prompt}</p>
        <button
          type="button"
          onClick={() => speak(prompt, "us")}
          aria-label="Read the question aloud"
          className="grid size-10 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
        >
          <Icon name="volume" className="size-5" />
        </button>
      </div>
      {sampleAnswer && (
        <div className="mt-3">
          <button type="button" onClick={() => setIsSampleOpen(!isSampleOpen)} aria-expanded={isSampleOpen} className="text-sm font-semibold text-brand">
            {isSampleOpen ? "Hide example answer" : "Show example answer"}
          </button>
          {isSampleOpen && (
            <>
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-surface px-3 py-2">
                <p className="flex-1 text-sm italic text-ink/90">“{sampleAnswer}”</p>
                <button
                  type="button"
                  onClick={() => speak(sampleAnswer, "us", 0.8)}
                  aria-label="Listen to the example answer"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-brand hover:bg-brand-soft"
                >
                  <Icon name="volume" className="size-5" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">Say it after the voice and check which words came out clearly, then answer with your own details below.</p>
              <div className="mt-2">
                <VoiceRecorder target={sampleAnswer} recordLabel="Say the example" />
              </div>
            </>
          )}
        </div>
      )}
      <div className="mt-3">
        <VoiceRecorder onRecorded={onRecorded} recordLabel="Record your answer" />
      </div>
    </li>
  );
}
