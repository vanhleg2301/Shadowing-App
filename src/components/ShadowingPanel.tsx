"use client";

import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
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

      <div className="mt-3">
        <VoiceRecorder
          target={sentence.text}
          onPlayOriginal={onPlaySentence}
          originalDurationSec={sentence.end - sentence.start}
          onBeforeRecord={onBeforeRecord}
          recordLabel="Record yourself"
        />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_2fr_1fr] gap-2">
        <button type="button" className="btn-3d py-3" onClick={onPrev} disabled={index === 0} aria-label="Previous sentence">
          <Icon name="prev" />
        </button>
        <button type="button" className="btn-3d py-3 text-sm" onClick={onPlaySentence}>
          <Icon name="play" className="size-4" />
          Listen to the original
        </button>
        <button type="button" className="btn-3d py-3" onClick={onNext} disabled={index >= total - 1} aria-label="Next sentence">
          <Icon name="next" />
        </button>
      </div>
    </div>
  );
}
