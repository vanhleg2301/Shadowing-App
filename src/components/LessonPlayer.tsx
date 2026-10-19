"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { recordProgress, setSavedWord } from "@/app/actions";
import { ClozePanel } from "@/components/ClozePanel";
import { DictationPanel } from "@/components/DictationPanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { ShadowingPanel } from "@/components/ShadowingPanel";
import { WordLookupSheet, type WordLookupState } from "@/components/WordLookupSheet";
import { useAuth } from "@/hooks/useAuth";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { normalizeWord, type WordInfo } from "@/lib/dictionary";
import { findActiveIndex, formatTime, type Lesson } from "@/lib/lesson";

const SPEEDS = [0.5, 0.75, 1, 1.25];
const LOOKUP_TIMEOUT_MS = 20000;
// Progress is saved at most this often while the learner moves through sentences.
const PROGRESS_INTERVAL_MS = 10000;

type Mode = "watch" | "shadow" | "dictation" | "cloze";

const MODES: { mode: Mode; label: string }[] = [
  { mode: "watch", label: "Watch" },
  { mode: "shadow", label: "Shadowing" },
  { mode: "dictation", label: "Dictation" },
  { mode: "cloze", label: "Cloze" },
];

interface LessonPlayerProps {
  lesson: Lesson;
  initialIsFavorite: boolean;
  initialSavedWords: string[];
  initialSentence: number;
}

export function LessonPlayer({ lesson, initialIsFavorite, initialSavedWords, initialSentence }: LessonPlayerProps) {
  const { user, isAvailable: isAuthAvailable, signInWithGoogle } = useAuth();
  const [savedWords, setSavedWords] = useState(() => new Set(initialSavedWords));
  const { sentences } = lesson;
  const { containerRef, isReady, isPlaying, currentTime, play, pause, seekTo, setRate } = useYouTubePlayer(
    lesson.videoId,
    lesson.sentences[initialSentence]?.start ?? 0,
  );
  const [mode, setMode] = useState<Mode>("watch");
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(initialSentence);
  const [isResumeVisible, setIsResumeVisible] = useState(initialSentence > 0);
  const hasInteractedRef = useRef(false);
  const lastProgressAtRef = useRef(0);
  // In dictation and cloze the transcript stays hidden until the learner has answered that sentence.
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [speed, setSpeed] = useState(1);
  const [showTranslation, setShowTranslation] = useState(lesson.hasTranslation);
  const [lookup, setLookup] = useState<WordLookupState | null>(null);
  const stopAtRef = useRef<number | null>(null);
  const rowRefs = useRef(new Map<number, HTMLDivElement>());

  const activeIndex = findActiveIndex(sentences, currentTime);
  const isPractice = mode !== "watch";
  const highlightIndex = isPractice ? practiceIndex : activeIndex;
  const currentIndex = isPractice ? practiceIndex : Math.max(activeIndex, 0);
  const isMasked = (i: number) => (mode === "dictation" || mode === "cloze") && !revealed.has(i);

  useEffect(() => {
    const stopAt = stopAtRef.current;
    if (stopAt !== null && currentTime >= stopAt) {
      stopAtRef.current = null;
      pause();
      return;
    }
    if (loopIndex !== null && currentTime >= sentences[loopIndex].end) {
      seekTo(sentences[loopIndex].start);
    }
  }, [currentTime, loopIndex, sentences, pause, seekTo]);

  useEffect(() => {
    if (isPlaying) hasInteractedRef.current = true;
  }, [isPlaying]);

  // Throttled save of where the learner is; skipped until they actually play or practise.
  useEffect(() => {
    if (!user || !hasInteractedRef.current) return;
    const wait = Math.max(0, PROGRESS_INTERVAL_MS - (Date.now() - lastProgressAtRef.current));
    const id = setTimeout(() => {
      lastProgressAtRef.current = Date.now();
      recordProgress({ videoId: lesson.videoId, sentenceIndex: currentIndex, sentenceCount: sentences.length });
    }, wait);
    return () => clearTimeout(id);
  }, [currentIndex, user, lesson.videoId, sentences.length]);

  useEffect(() => {
    if (highlightIndex < 0) return;
    rowRefs.current.get(highlightIndex)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightIndex]);

  const playSentence = (index: number) => {
    seekTo(sentences[index].start);
    stopAtRef.current = isPractice ? sentences[index].end : null;
    play();
  };

  const goToSentence = (index: number) => {
    if (index < 0 || index >= sentences.length) return;
    hasInteractedRef.current = true;
    setIsResumeVisible(false);
    if (isPractice) {
      setPracticeIndex(index);
      playSentence(index);
      return;
    }
    if (loopIndex !== null) setLoopIndex(index);
    seekTo(sentences[index].start);
    play();
  };

  const handleModeChange = (next: Mode) => {
    setMode(next);
    setLoopIndex(null);
    stopAtRef.current = null;
    setRevealed(new Set());
    if (next !== "watch") {
      setPracticeIndex(Math.max(activeIndex, 0));
      pause();
    }
  };

  const revealCurrent = () => {
    hasInteractedRef.current = true;
    setRevealed((prev) => new Set(prev).add(practiceIndex));
  };

  const handleStartOver = () => {
    setIsResumeVisible(false);
    setPracticeIndex(0);
    seekTo(0);
    pause();
  };

  const handleToggleLoop = () => {
    setLoopIndex(loopIndex === null ? Math.max(activeIndex, 0) : null);
  };

  const handleSpeedChange = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    setRate(next);
  };

  const fetchLookup = async (word: string, sentence: string) => {
    setLookup({ word, sentence, status: "loading", info: null });
    let info: WordInfo | null = null;
    try {
      const query = new URLSearchParams({ word, sentence });
      const res = await fetch(`/api/lookup?${query}`, {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      });
      if (res.ok) info = await res.json();
    } catch {
      // Network failure or timeout: fall through to the error state so the sheet never hangs on "loading".
    }
    setLookup((current) =>
      current?.word === word ? { word, sentence, status: info ? "found" : "error", info } : current,
    );
  };

  const handleToggleSave = async (current: WordLookupState) => {
    const isSaved = !savedWords.has(current.word);
    const update = (save: boolean) =>
      setSavedWords((prev) => {
        const next = new Set(prev);
        if (save) next.add(current.word);
        else next.delete(current.word);
        return next;
      });
    update(isSaved);
    const result = await setSavedWord({
      word: current.word,
      sentence: current.sentence,
      videoId: lesson.videoId,
      entry: current.info ? { ...current.info } : null,
      isSaved,
    });
    if (result.ok) return;
    update(!isSaved);
    if (result.error === "signed-out") await signInWithGoogle();
  };

  const handleWordClick = (token: string, sentence: string) => {
    const word = normalizeWord(token);
    if (!word) return;
    pause();
    fetchLookup(word, sentence);
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-7xl flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-[auto_auto_1fr]">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-cream px-4 py-3 lg:col-span-2 lg:flex-nowrap lg:px-6">
        <Link href="/" aria-label="Back to home" className="btn-3d size-10 shrink-0 rounded-full">
          <Icon name="back" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold text-ink">{lesson.title}</h1>
          <p className="truncate text-sm text-muted">{lesson.author}</p>
        </div>
        <FavoriteButton videoId={lesson.videoId} title={lesson.title} initialIsFavorite={initialIsFavorite} />
        <div className="flex w-full gap-1 rounded-2xl border border-line bg-white p-1 lg:w-auto lg:shrink-0">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => handleModeChange(m.mode)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                mode === m.mode
                  ? "bg-brand text-white shadow-[0_2px_0_0_var(--color-brand-dark)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="shrink-0 lg:px-6 lg:pt-6">
        <div className="relative aspect-video w-full overflow-hidden bg-black lg:rounded-3xl lg:shadow-[0_4px_0_0_var(--color-line)]">
          <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          {!isReady && (
            <p className="absolute inset-0 grid place-items-center text-sm text-white/60">Loading video...</p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-cream px-3 py-3 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:border-l lg:border-line lg:bg-white lg:px-4">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-muted">
          Transcript · {sentences.length} sentences
        </p>
        {isResumeVisible && (
          <div className="mb-3 flex animate-fade-in items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm">
            <span className="text-ink">
              Continuing from sentence <b>{initialSentence + 1}</b>
            </span>
            <button type="button" onClick={handleStartOver} className="shrink-0 font-semibold text-brand hover:text-brand-dark">
              Start over
            </button>
          </div>
        )}
        {sentences.map((sentence, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) rowRefs.current.set(i, el);
              else rowRefs.current.delete(i);
            }}
            className={`mb-1.5 flex gap-2 rounded-2xl border px-2 py-2.5 transition-colors ${
              i === highlightIndex ? "border-brand/40 bg-brand-soft" : "border-transparent"
            }`}
          >
            <button
              type="button"
              onClick={() => goToSentence(i)}
              aria-label={`Play sentence ${i + 1}`}
              className="mt-0.5 h-fit shrink-0 rounded-lg px-1.5 py-0.5 font-mono text-xs font-semibold text-brand hover:bg-brand-soft"
            >
              {formatTime(sentence.start)}
            </button>
            {isMasked(i) ? (
              <p aria-label="Hidden until you answer" className="min-w-0 select-none text-[17px] leading-relaxed text-ink/60 blur-[6px]">
                {sentence.text}
              </p>
            ) : (
              <div className="min-w-0">
                <p className={`text-[17px] leading-relaxed ${i === highlightIndex ? "text-ink" : "text-ink/70"}`}>
                  {sentence.text.split(/(\s+)/).map((token, j) =>
                    /\s/.test(token) || !normalizeWord(token) ? (
                      token
                    ) : (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleWordClick(token, sentence.text)}
                        className="rounded-md hover:bg-amber-200/70 hover:text-ink"
                      >
                        {token}
                      </button>
                    ),
                  )}
                </p>
                {showTranslation && sentence.translation && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">{sentence.translation}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 lg:col-start-1 lg:row-start-3 lg:self-start lg:border-0 lg:bg-transparent lg:px-6 lg:pt-5">
        {mode === "shadow" && (
          <ShadowingPanel
            key={practiceIndex}
            sentence={sentences[practiceIndex]}
            index={practiceIndex}
            total={sentences.length}
            showTranslation={showTranslation}
            onPlaySentence={() => playSentence(practiceIndex)}
            onPrev={() => goToSentence(practiceIndex - 1)}
            onNext={() => goToSentence(practiceIndex + 1)}
            onBeforeRecord={pause}
          />
        )}
        {mode === "dictation" && (
          <DictationPanel
            key={practiceIndex}
            sentence={sentences[practiceIndex]}
            index={practiceIndex}
            total={sentences.length}
            onListen={() => playSentence(practiceIndex)}
            onPrev={() => goToSentence(practiceIndex - 1)}
            onNext={() => goToSentence(practiceIndex + 1)}
            onReveal={revealCurrent}
          />
        )}
        {mode === "cloze" && (
          <ClozePanel
            key={practiceIndex}
            sentence={sentences[practiceIndex]}
            index={practiceIndex}
            total={sentences.length}
            onListen={() => playSentence(practiceIndex)}
            onPrev={() => goToSentence(practiceIndex - 1)}
            onNext={() => goToSentence(practiceIndex + 1)}
            onReveal={revealCurrent}
          />
        )}
        {mode === "watch" && (
          <div className="grid grid-cols-6 gap-2 lg:max-w-xl">
            <button type="button" className="btn-3d py-3" onClick={() => goToSentence(currentIndex - 1)} aria-label="Previous sentence">
              <Icon name="prev" />
            </button>
            <button
              type="button"
              className="btn-3d btn-brand py-3"
              onClick={isPlaying ? pause : play}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <Icon name={isPlaying ? "pause" : "play"} />
            </button>
            <button type="button" className="btn-3d py-3" onClick={() => goToSentence(currentIndex + 1)} aria-label="Next sentence">
              <Icon name="next" />
            </button>
            <button
              type="button"
              className={`btn-3d py-3 ${loopIndex !== null ? "btn-soft" : ""}`}
              onClick={handleToggleLoop}
              aria-label="Repeat sentence"
              aria-pressed={loopIndex !== null}
            >
              <Icon name="repeat" />
            </button>
            <button type="button" className="btn-3d py-3 text-sm" onClick={handleSpeedChange} aria-label="Playback speed">
              {speed}x
            </button>
            <button
              type="button"
              className={`btn-3d py-3 text-sm ${showTranslation ? "btn-soft" : ""}`}
              onClick={() => setShowTranslation(!showTranslation)}
              disabled={!lesson.hasTranslation}
              aria-label="Show or hide Vietnamese translation"
              aria-pressed={showTranslation}
            >
              VI
            </button>
          </div>
        )}
      </div>

      {lookup && (
        <WordLookupSheet
          lookup={lookup}
          onClose={() => setLookup(null)}
          onRetry={() => fetchLookup(lookup.word, lookup.sentence)}
          saved={isAuthAvailable ? { isSaved: savedWords.has(lookup.word), onToggle: () => handleToggleSave(lookup) } : undefined}
        />
      )}
    </div>
  );
}
