"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Words } from "@/components/TranscriptRow";
import { WordLookupSheet } from "@/components/WordLookupSheet";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useWordLookup } from "@/hooks/useWordLookup";
import { findActiveIndex, type Lesson } from "@/lib/lesson";

interface NewsReaderProps {
  lesson: Lesson & { media: NonNullable<Lesson["media"]> };
  category: string;
  dateLabel: string | null;
  initialSavedWords: string[];
}

const RATES = [1, 0.9, 0.75];
const SKIP_S = 5;
// Lessons imported before paragraph marks existed are split into blocks of this many sentences.
const FALLBACK_PARAGRAPH = 3;

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Read a VOA news story like the original page while its audio plays: the sentence being read is
// highlighted, any word opens its meaning, and any sentence can be replayed.
export function NewsReader({ lesson, category, dateLabel, initialSavedWords }: NewsReaderProps) {
  const { sentences } = lesson;
  const { isPlaying, currentTime, play, pause, seekTo, setRate } = useAudioPlayer(lesson.media.audioUrl);
  const { lookup, openWord, sheetProps } = useWordLookup(lesson.videoId, initialSavedWords);
  const [rateIndex, setRateIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const sentenceRefs = useRef(new Map<number, HTMLSpanElement>());

  const activeIndex = hasStarted ? findActiveIndex(sentences, currentTime) : -1;
  const duration = lesson.durationSec || sentences[sentences.length - 1]?.end || 0;

  const paragraphs: number[][] = [];
  sentences.forEach((sentence, i) => {
    const key = sentence.paragraph ?? Math.floor(i / FALLBACK_PARAGRAPH);
    const last = paragraphs[paragraphs.length - 1];
    const lastKey = last ? (sentences[last[0]].paragraph ?? Math.floor(last[0] / FALLBACK_PARAGRAPH)) : null;
    if (last && lastKey === key) last.push(i);
    else paragraphs.push([i]);
  });

  useEffect(() => {
    if (!isPlaying || activeIndex < 0) return;
    const el = sentenceRefs.current.get(activeIndex);
    if (!el) return;
    const box = el.getBoundingClientRect();
    // Only follow when the sentence leaves the comfortable reading area, so the page doesn't jump on every line.
    if (box.top < 80 || box.bottom > window.innerHeight - 180) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex, isPlaying]);

  const handlePlay = () => {
    setHasStarted(true);
    play();
  };

  const playFrom = (seconds: number) => {
    setHasStarted(true);
    seekTo(Math.max(0, seconds));
    play();
  };

  const goToSentence = (index: number) => {
    const target = sentences[Math.min(Math.max(index, 0), sentences.length - 1)];
    if (target) playFrom(target.start);
  };

  const handleRate = () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    setRate(RATES[next]);
  };

  const handleWordClick = (token: string, sentence: string) => {
    if (openWord(token, sentence)) pause();
  };

  useMediaSession({
    title: sentences[Math.max(activeIndex, 0)]?.text ?? lesson.title,
    artist: lesson.title,
    artworkUrl: lesson.media.imageUrl,
    isPlaying,
    onPlay: handlePlay,
    onPause: pause,
    onPrevious: () => goToSentence(activeIndex - 1),
    onNext: () => goToSentence(activeIndex + 1),
    onSeekBackward: () => seekTo(Math.max(0, currentTime - SKIP_S)),
  });

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-44 pt-[calc(env(safe-area-inset-top)+1rem)] md:px-8 md:pb-32">
      <Link href="/news" className="text-sm font-semibold text-brand">
        ← All news
      </Link>
      <div className="relative mt-3 aspect-video overflow-hidden rounded-3xl bg-cream">
        <Image src={lesson.media.imageUrl} alt="" fill priority sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent">
        {category}
        {dateLabel && <span className="text-muted"> · {dateLabel}</span>}
      </p>
      <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-ink md:text-3xl">{lesson.title}</h1>
      <p className="mt-2 text-sm text-muted">Tap a word for its meaning. Tap a sentence to hear it.</p>

      <div lang="en" className="mt-5 space-y-4 text-[19px] leading-relaxed text-ink">
        {paragraphs.map((indexes) => (
          <p key={indexes[0]}>
            {indexes.map((i) => (
              <span key={i}>
                <span
                  ref={(el) => {
                    if (el) sentenceRefs.current.set(i, el);
                    else sentenceRefs.current.delete(i);
                  }}
                  onClick={() => playFrom(sentences[i].start)}
                  className={`cursor-pointer rounded-md transition-colors ${i === activeIndex ? "bg-brand-soft text-ink" : ""}`}
                >
                  <Words text={sentences[i].text} activeWord={-1} onWordClick={handleWordClick} />
                </span>{" "}
              </span>
            ))}
          </p>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted">Story and audio: VOA Learning English (public domain).</p>

      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 rounded-3xl border border-line bg-surface/95 p-3 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] backdrop-blur-xl md:inset-x-auto md:bottom-6 md:left-[calc(50%+8rem)] md:w-[36rem] md:-translate-x-1/2">
        <input
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          step={0.1}
          value={Math.min(currentTime, duration)}
          onChange={(event) => playFrom(Number(event.target.value))}
          aria-label="Position"
          className="w-full accent-[var(--color-brand)]"
        />
        <div className="mt-1 flex items-center gap-2">
          <span className="w-20 text-xs font-semibold tabular-nums text-muted">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex flex-1 items-center justify-center gap-2">
            <button type="button" onClick={() => seekTo(Math.max(0, currentTime - SKIP_S))} className="btn-3d px-3 py-2 text-sm font-bold" aria-label={`Back ${SKIP_S} seconds`}>
              −{SKIP_S}s
            </button>
            <button type="button" onClick={isPlaying ? pause : handlePlay} className="btn-3d btn-brand size-12 rounded-full" aria-label={isPlaying ? "Pause" : "Play"}>
              <Icon name={isPlaying ? "pause" : "play"} className="size-6" />
            </button>
            <button type="button" onClick={handleRate} className="btn-3d px-3 py-2 text-sm font-bold" aria-label="Playback speed">
              {RATES[rateIndex]}×
            </button>
          </div>
          <Link href={`/watch/${lesson.videoId}?mode=shadow`} className="w-20 text-right text-xs font-bold text-brand">
            Shadow it
          </Link>
        </div>
      </div>

      {lookup && sheetProps && <WordLookupSheet {...sheetProps} />}
    </article>
  );
}
