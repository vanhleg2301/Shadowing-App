"use client";

import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { speak } from "@/lib/speech";

interface SpeakingPromptProps {
  index: number;
  prompt: string;
  onRecorded: () => void;
}

// One question to answer out loud; the recording stays on this device so the learner can listen back.
export function SpeakingPrompt({ index, prompt, onRecorded }: SpeakingPromptProps) {
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
      <div className="mt-3">
        <VoiceRecorder onRecorded={onRecorded} recordLabel="Record your answer" />
      </div>
    </li>
  );
}
