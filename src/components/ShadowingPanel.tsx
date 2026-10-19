"use client";

import { Icon } from "@/components/Icon";
import { useRecorder } from "@/hooks/useRecorder";
import type { Sentence } from "@/lib/lesson";

interface ShadowingPanelProps {
  sentence: Sentence;
  index: number;
  total: number;
  showTranslation: boolean;
  onPlaySentence: () => void;
  onPrev: () => void;
  onNext: () => void;
  onBeforeRecord: () => void;
}

export function ShadowingPanel({
  sentence,
  index,
  total,
  showTranslation,
  onPlaySentence,
  onPrev,
  onNext,
  onBeforeRecord,
}: ShadowingPanelProps) {
  const { isRecording, audioUrl, error, start, stop } = useRecorder();

  const handleRecord = () => {
    if (isRecording) {
      stop();
      return;
    }
    onBeforeRecord();
    start();
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span>
          Sentence {index + 1}/{total}
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold leading-snug text-ink md:text-xl">{sentence.text}</p>
      {showTranslation && sentence.translation && <p className="mt-1 text-sm text-muted">{sentence.translation}</p>}

      {audioUrl && (
        <div className="mt-3 animate-fade-in rounded-2xl bg-cream p-2">
          <p className="px-1 pb-1 text-xs font-semibold text-muted">Your voice</p>
          <audio className="h-10 w-full" src={audioUrl} controls />
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid grid-cols-[1fr_1.4fr_1.4fr_1fr] gap-2">
        <button type="button" className="btn-3d py-3" onClick={onPrev} disabled={index === 0} aria-label="Previous sentence">
          <Icon name="prev" />
        </button>
        <button type="button" className="btn-3d py-3 text-sm" onClick={onPlaySentence} disabled={isRecording}>
          <Icon name="play" className="size-4" />
          Listen
        </button>
        <button
          type="button"
          className={`btn-3d py-3 text-sm ${isRecording ? "border-red-700 bg-red-600 text-white shadow-[0_3px_0_0_#b91c1c]" : "btn-brand"}`}
          onClick={handleRecord}
        >
          <Icon name={isRecording ? "stop" : "record"} className="size-4" />
          {isRecording ? "Stop" : "Record"}
        </button>
        <button type="button" className="btn-3d py-3" onClick={onNext} disabled={index >= total - 1} aria-label="Next sentence">
          <Icon name="next" />
        </button>
      </div>
    </div>
  );
}
