"use client";

import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import type { Sentence } from "@/lib/lesson";

interface ShadowingPanelProps {
  sentence: Sentence;
  index: number;
  total: number;
  hasNextPart?: boolean;
  showTranslation: boolean;
  onPlaySentence: () => Promise<void> | void;
  onPrev: () => void;
  onNext: () => void;
  onBeforeRecord: () => void;
  isPlayThrough: boolean;
  onPlayThroughChange: (isOn: boolean) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function ShadowingPanel({
  sentence,
  index,
  total,
  hasNextPart = false,
  showTranslation,
  onPlaySentence,
  onPrev,
  onNext,
  onBeforeRecord,
  isPlayThrough,
  onPlayThroughChange,
  isPlaying,
  onPlayPause,
}: ShadowingPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span>
          Sentence {index + 1}/{total}
        </span>
        <div className="flex items-center gap-3">
          {/* Plays the video without stopping after each sentence; the learner pauses to shadow a line. */}
          <label className="flex cursor-pointer items-center gap-2" title="Keeps playing without stopping. Pause when you want to shadow a line.">
            <input
              id="shadow-play-through"
              type="checkbox"
              role="switch"
              checked={isPlayThrough}
              onChange={(event) => onPlayThroughChange(event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-5 w-8 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-3 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand"
            />
            <span className="text-ink">Play through</span>
          </label>
          <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-line sm:block">
            <div className="h-full bg-brand" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
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
          hasAutoCycle
        />
      </div>

      <div className="mt-3 grid grid-cols-[1fr_2fr_1fr] gap-2">
        <button type="button" className="btn-3d py-3" onClick={onPrev} disabled={index === 0} aria-label="Previous sentence">
          <Icon name="prev" />
        </button>
        {isPlayThrough ? (
          <button type="button" className="btn-3d btn-brand py-3 text-sm" onClick={onPlayPause}>
            <Icon name={isPlaying ? "pause" : "play"} className="size-4" />
            {isPlaying ? "Pause to shadow" : "Play"}
          </button>
        ) : (
          <button type="button" className="btn-3d py-3 text-sm" onClick={onPlaySentence}>
            <Icon name="play" className="size-4" />
            Listen to the original
          </button>
        )}
        <button type="button" className="btn-3d py-3" onClick={onNext} disabled={index >= total - 1 && !hasNextPart} aria-label="Next sentence">
          <Icon name="next" />
        </button>
      </div>
    </div>
  );
}
