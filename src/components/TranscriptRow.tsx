"use client";

import { memo } from "react";
import { normalizeWord } from "@/lib/dictionary";
import { formatTime, type Sentence } from "@/lib/lesson";

interface TranscriptRowProps {
  sentence: Sentence;
  index: number;
  isHighlighted: boolean;
  // Karaoke word index; -1 for every row except the one being played.
  activeWord: number;
  isMasked: boolean;
  textSizeClass: string;
  showTranslation: boolean;
  registerRow: (index: number, el: HTMLDivElement | null) => void;
  onReplay: (index: number) => void;
  onPlayFrom: (index: number) => void;
  onWordClick: (token: string, sentence: string) => void;
}

// Memoised so the video's 10-per-second time updates only re-render the row being played,
// not every sentence of the transcript. Callbacks passed in must be stable.
export const TranscriptRow = memo(function TranscriptRow({
  sentence,
  index,
  isHighlighted,
  activeWord,
  isMasked,
  textSizeClass,
  showTranslation,
  registerRow,
  onReplay,
  onPlayFrom,
  onWordClick,
}: TranscriptRowProps) {
  return (
    <div
      ref={(el) => registerRow(index, el)}
      onClick={() => {
        // Don't hijack a text selection (e.g. copying a sentence).
        if (window.getSelection()?.toString()) return;
        onReplay(index);
      }}
      title="Click to replay this sentence"
      className={`group/row mb-1.5 flex cursor-pointer gap-2 rounded-2xl border px-2 py-2.5 transition-colors ${
        isHighlighted ? "border-brand/40 bg-brand-soft hover:border-brand/60" : "border-transparent hover:border-line hover:bg-surface lg:hover:bg-cream"
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPlayFrom(index);
        }}
        aria-label={`Play from sentence ${index + 1}`}
        title="Play from here"
        className="mt-0.5 h-fit shrink-0 rounded-lg px-1.5 py-0.5 font-mono text-xs font-semibold text-brand hover:bg-brand-soft"
      >
        {formatTime(sentence.start)}
      </button>
      {isMasked ? (
        <p aria-label="Hidden until you answer" className={`min-w-0 select-none leading-relaxed text-ink/60 blur-[6px] ${textSizeClass}`}>
          {sentence.text}
        </p>
      ) : (
        <div className="min-w-0">
          <p className={`leading-relaxed ${textSizeClass} ${isHighlighted ? "text-ink" : "text-ink/70"}`}>
            <Words text={sentence.text} activeWord={activeWord} onWordClick={onWordClick} />
          </p>
          {showTranslation && sentence.translation && <p className="mt-1 text-sm leading-relaxed text-muted">{sentence.translation}</p>}
        </div>
      )}
    </div>
  );
});

interface WordsProps {
  text: string;
  activeWord: number;
  onWordClick: (token: string, sentence: string) => void;
}

// Karaoke: words already spoken turn green and the current word is highlighted (auto-caption videos only).
export function Words({ text, activeWord, onWordClick }: WordsProps) {
  let wordIndex = -1;
  return text.split(/(\s+)/).map((token, j) => {
    if (token === "" || /\s/.test(token)) return token;
    wordIndex++;
    const karaokeClass =
      activeWord < 0 ? "" : wordIndex === activeWord ? "bg-highlight text-highlight-ink" : wordIndex < activeWord ? "text-brand-dark" : "";
    if (!normalizeWord(token)) {
      return (
        <span key={j} className={karaokeClass}>
          {token}
        </span>
      );
    }
    return (
      <button
        key={j}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onWordClick(token, text);
        }}
        className={`rounded-md transition-colors duration-150 hover:bg-highlight/60 hover:text-ink ${karaokeClass}`}
      >
        {token}
      </button>
    );
  });
}
