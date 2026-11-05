"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Words } from "@/components/TranscriptRow";
import type { StudySentence } from "@/lib/video-study";

interface VideoSentenceProps {
  sentence: StudySentence;
  // Plays this sentence of the video.
  onHear: () => void;
  // The word or chunk to show in bold.
  highlight?: string;
  // Text starts hidden: hear it first, then check.
  isHiddenFirst?: boolean;
  onWordClick: (token: string, sentence: string) => void;
}

// One sentence as it is said in the video: tap a word for its meaning, or hear the speaker say it.
export function VideoSentence({ sentence, onHear, highlight, isHiddenFirst = false, onWordClick }: VideoSentenceProps) {
  const [isShown, setIsShown] = useState(!isHiddenFirst);
  const [isTranslationShown, setIsTranslationShown] = useState(false);
  const at = highlight ? sentence.text.indexOf(highlight) : -1;

  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <div lang="en" className="min-w-0 flex-1 text-lg leading-relaxed text-ink">
          {!isShown ? (
            <button type="button" onClick={() => setIsShown(true)} className="w-full text-left" aria-label="Show the sentence">
              <span className="select-none text-ink/60 blur-[6px]" aria-hidden="true">
                {sentence.text}
              </span>
            </button>
          ) : at >= 0 && highlight ? (
            <p>
              <Words text={sentence.text.slice(0, at)} activeWord={-1} onWordClick={onWordClick} />
              <mark className="rounded-md bg-highlight px-0.5 font-bold text-highlight-ink">
                <Words text={highlight} activeWord={-1} onWordClick={onWordClick} />
              </mark>
              <Words text={sentence.text.slice(at + highlight.length)} activeWord={-1} onWordClick={onWordClick} />
            </p>
          ) : (
            <p>
              <Words text={sentence.text} activeWord={-1} onWordClick={onWordClick} />
            </p>
          )}
        </div>
        <button type="button" onClick={onHear} className="btn-3d shrink-0 px-3 py-1.5 text-sm" aria-label="Hear it in the video">
          <Icon name="play" className="size-4" />
          Hear it
        </button>
      </div>
      {isShown && sentence.translation && (
        <div className="mt-2">
          {isTranslationShown ? (
            <p className="text-sm text-muted">{sentence.translation}</p>
          ) : (
            <button type="button" onClick={() => setIsTranslationShown(true)} className="text-sm font-semibold text-brand">
              Show translation
            </button>
          )}
        </div>
      )}
      {!isShown && <p className="mt-1 text-xs text-muted">Hear it first, then tap to check.</p>}
    </li>
  );
}
