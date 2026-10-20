"use client";

import { Icon } from "@/components/Icon";
import { useRecorder } from "@/hooks/useRecorder";

interface SpeakingPromptProps {
  index: number;
  prompt: string;
  onRecorded: () => void;
}

// One question to answer out loud; the recording stays on this device so the learner can listen back.
export function SpeakingPrompt({ index, prompt, onRecorded }: SpeakingPromptProps) {
  const { isRecording, audioUrl, error, start, stop } = useRecorder();

  const handleClick = () => {
    if (isRecording) {
      stop();
      onRecorded();
    } else {
      start();
    }
  };

  return (
    <li className="rounded-2xl border border-line bg-cream p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">{index + 1}</span>
        <p className="flex-1 font-semibold leading-snug text-ink">{prompt}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 pl-10">
        <button
          type="button"
          onClick={handleClick}
          className={`btn-3d px-4 py-2 text-sm ${
            isRecording ? "border-red-700 bg-red-600 text-white shadow-[0_3px_0_0_#b91c1c]" : "btn-brand"
          }`}
        >
          <Icon name={isRecording ? "stop" : "record"} className="size-4" />
          {isRecording ? "Stop" : audioUrl ? "Record again" : "Record answer"}
        </button>
        {audioUrl && <audio src={audioUrl} controls className="h-9 max-w-full flex-1" />}
      </div>
      {error && <p className="mt-2 pl-10 text-sm text-red-600">{error}</p>}
    </li>
  );
}
