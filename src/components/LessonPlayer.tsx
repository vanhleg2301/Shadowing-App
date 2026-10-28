"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { recordProgress, setSavedWord } from "@/app/actions";
import { ClozePanel } from "@/components/ClozePanel";
import { DictationPanel } from "@/components/DictationPanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { LessonSettingsSheet } from "@/components/LessonSettingsSheet";
import { ShadowingPanel } from "@/components/ShadowingPanel";
import { StudyTimer } from "@/components/StudyTimer";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TranscriptRow } from "@/components/TranscriptRow";
import { WordLookupSheet, type WordLookupState } from "@/components/WordLookupSheet";
import { useAuth } from "@/hooks/useAuth";
import { useLessonPrefs, type TextSize } from "@/hooks/useLessonPrefs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { normalizeWord, type WordInfo } from "@/lib/dictionary";
import { findActiveIndex, findActiveWord, type Lesson } from "@/lib/lesson";

const SPEEDS = [0.5, 0.75, 1, 1.25];
const LOOKUP_TIMEOUT_MS = 20000;
// Progress is saved at most this often while the learner moves through sentences.
const PROGRESS_INTERVAL_MS = 10000;

const TEXT_SIZE_CLASS: Record<TextSize, string> = {
  sm: "text-[15px]",
  md: "text-[17px]",
  lg: "text-[20px] leading-relaxed",
};

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
  initialMode?: Mode;
  // Course "listen first" blocks hide the transcript for this visit without changing the saved preference.
  isListenFirst?: boolean;
  backHref?: string;
}

export function LessonPlayer({
  lesson,
  initialIsFavorite,
  initialSavedWords,
  initialSentence,
  initialMode = "watch",
  isListenFirst = false,
  backHref = "/",
}: LessonPlayerProps) {
  const { user, isAvailable: isAuthAvailable, signInWithGoogle } = useAuth();
  const [savedWords, setSavedWords] = useState(() => new Set(initialSavedWords));
  const { sentences } = lesson;
  const startSeconds = lesson.sentences[initialSentence]?.start ?? 0;
  // Both hooks are always called; only the one matching the lesson's media mounts a player.
  const youTube = useYouTubePlayer(lesson.media ? null : lesson.videoId, startSeconds);
  const audio = useAudioPlayer(lesson.media?.audioUrl ?? null, startSeconds);
  const { containerRef } = youTube;
  const { isReady, isPlaying, currentTime, play, pause, seekTo, playSegment, setRate } = lesson.media ? audio : youTube;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(initialSentence);
  const [isResumeVisible, setIsResumeVisible] = useState(initialSentence > 0);
  const hasInteractedRef = useRef(false);
  const lastProgressAtRef = useRef(0);
  // In dictation and cloze the transcript stays hidden until the learner has answered that sentence.
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [speed, setSpeed] = useState(1);
  const { prefs, updatePrefs } = useLessonPrefs();
  const showTranslation = lesson.hasTranslation && prefs.showTranslation;
  const [isSessionListenFirst, setIsSessionListenFirst] = useState(isListenFirst);
  const isHideText = prefs.hideText || isSessionListenFirst;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [panel, setPanel] = useState<"transcript" | "summary">("transcript");
  const [isFollowPaused, setIsFollowPaused] = useState(false);
  const [lookup, setLookup] = useState<WordLookupState | null>(null);
  const rowRefs = useRef(new Map<number, HTMLDivElement>());

  const activeIndex = findActiveIndex(sentences, currentTime);
  const isPractice = mode !== "watch";
  const highlightIndex = isPractice ? practiceIndex : activeIndex;
  const currentIndex = isPractice ? practiceIndex : Math.max(activeIndex, 0);
  const isMasked = (i: number) =>
    (mode === "dictation" || mode === "cloze" || (mode === "watch" && isHideText)) && !revealed.has(i);

  useEffect(() => {
    if (loopIndex !== null && currentTime >= sentences[loopIndex].end) {
      seekTo(sentences[loopIndex].start);
    }
  }, [currentTime, loopIndex, sentences, seekTo]);

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
    if (highlightIndex < 0 || !prefs.autoScroll || isFollowPaused) return;
    rowRefs.current.get(highlightIndex)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightIndex, prefs.autoScroll, isFollowPaused]);

  // Once the learner scrolls away, the transcript stays where they left it until they tap
  // "Back to current sentence" or scroll the playing sentence back into view themselves.
  const handleManualScroll = () => {
    if (!isFollowPaused) setIsFollowPaused(true);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const row = rowRefs.current.get(highlightIndex);
    if (!isFollowPaused || !row) return;
    const view = event.currentTarget.getBoundingClientRect();
    const box = row.getBoundingClientRect();
    if (box.top >= view.top && box.bottom <= view.bottom) setIsFollowPaused(false);
  };

  const jumpToCurrent = () => {
    setIsFollowPaused(false);
    rowRefs.current.get(Math.max(highlightIndex, 0))?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const playSentence = (index: number): Promise<void> => {
    if (isPractice) return playSegment(sentences[index].start, sentences[index].end);
    seekTo(sentences[index].start);
    play();
    return Promise.resolve();
  };

  // Clicking a transcript row plays just that sentence once, in every mode.
  const replaySentence = (index: number) => {
    hasInteractedRef.current = true;
    setIsResumeVisible(false);
    if (mode === "watch" && isHideText) setRevealed((prev) => new Set(prev).add(index));
    if (isPractice) setPracticeIndex(index);
    playSegment(sentences[index].start, sentences[index].end);
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

  // Stable callbacks for the memoised transcript rows; they call the latest handlers through a ref.
  const rowActionsRef = useRef({ replaySentence, goToSentence, handleWordClick });
  useEffect(() => {
    rowActionsRef.current = { replaySentence, goToSentence, handleWordClick };
  });
  const onReplayRow = useCallback((index: number) => rowActionsRef.current.replaySentence(index), []);
  const onPlayFromRow = useCallback((index: number) => rowActionsRef.current.goToSentence(index), []);
  const onWordClick = useCallback((token: string, text: string) => rowActionsRef.current.handleWordClick(token, text), []);
  const registerRow = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(index, el);
    else rowRefs.current.delete(index);
  }, []);

  // Desktop shortcuts. The handler is replaced every render so it always sees the current state.
  const shortcutRef = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    shortcutRef.current = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.closest("input, textarea, select, [contenteditable='true']");
      if (isTyping || lookup || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === " ") {
        event.preventDefault();
        if (isPractice) playSentence(practiceIndex);
        else if (isPlaying) pause();
        else play();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSentence(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSentence(currentIndex + 1);
      } else if (event.key.toLowerCase() === "r" && !isPractice) {
        handleToggleLoop();
      }
    };
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => shortcutRef.current(event);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-7xl flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-[auto_auto_1fr]">
      <StudyTimer isBusy={isPlaying} />
      <header className="relative flex flex-wrap items-center gap-2.5 border-b border-line bg-cream px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] sm:px-4 lg:col-span-2 lg:flex-nowrap lg:gap-3 lg:px-6 lg:py-3">
        <Link href={backHref} aria-label={backHref === "/" ? "Back to home" : "Back to the course"} className="btn-3d size-10 shrink-0 rounded-full">
          <Icon name="back" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold text-ink">{lesson.title}</h1>
          <p className="truncate text-sm text-muted">{lesson.author}</p>
        </div>
        <FavoriteButton videoId={lesson.videoId} title={lesson.title} initialIsFavorite={initialIsFavorite} />
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Display settings"
          className="btn-3d size-10 shrink-0 rounded-full text-sm font-extrabold"
        >
          Aa
        </button>
        <div className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1 lg:w-auto lg:shrink-0">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => handleModeChange(m.mode)}
              className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                mode === m.mode
                  ? "bg-brand text-on-brand shadow-[0_2px_0_0_var(--color-brand-dark)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Lesson progress: how far through the sentences the learner is. */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-line" aria-hidden="true">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Listening comes first: on phones the video gets more of the screen than the transcript. */}
      <div className="flex min-h-0 flex-[3] flex-col bg-black lg:flex-none lg:bg-transparent lg:px-6 lg:pt-6">
        <div className="relative min-h-[56.25vw] w-full flex-1 overflow-hidden bg-black lg:aspect-video lg:min-h-0 lg:flex-none lg:rounded-3xl lg:shadow-[0_4px_0_0_var(--color-line)]">
          {lesson.media ? (
            <button
              type="button"
              onClick={isPlaying ? pause : play}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="group absolute inset-0"
            >
              <Image src={lesson.media.imageUrl} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover opacity-80" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-brand text-on-brand shadow-lg transition-transform group-active:scale-95">
                  <Icon name={isPlaying ? "pause" : "play"} className="size-7" />
                </span>
              </span>
            </button>
          ) : (
            <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          )}
          {!isReady && (
            <p className="absolute inset-0 grid place-items-center text-sm text-white/60">Loading video...</p>
          )}
        </div>
      </div>

      <div
        onWheel={handleManualScroll}
        onTouchMove={handleManualScroll}
        onScroll={handleScroll}
        className="relative min-h-0 flex-[2] overflow-y-auto bg-cream px-3 py-3 lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:border-l lg:border-line lg:bg-surface lg:px-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
          <div role="tablist" aria-label="Lesson panel" className="flex rounded-xl border border-line bg-surface p-0.5">
            {(["transcript", "summary"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={panel === p}
                onClick={() => setPanel(p)}
                className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-colors ${
                  panel === p ? "bg-brand text-on-brand" : "text-muted hover:text-ink"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {panel === "transcript" && (
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              Sentence {currentIndex + 1} / {sentences.length}
            </p>
          )}
          {panel === "transcript" && mode === "watch" && isHideText && (
            <button
              type="button"
              onClick={() => {
                setIsSessionListenFirst(false);
                if (prefs.hideText) updatePrefs({ hideText: false });
              }}
              className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand"
            >
              Listen first · tap a line · show all
            </button>
          )}
        </div>
        {panel === "summary" ? (
          <SummaryPanel lesson={lesson} onPlaySentence={replaySentence} />
        ) : (
          <>
          {isResumeVisible && (
            <div className="mb-3 flex animate-fade-in items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-3 py-2 text-sm">
              <span className="text-ink">
                Continuing from sentence <b>{initialSentence + 1}</b>
              </span>
              <button type="button" onClick={handleStartOver} className="shrink-0 font-semibold text-brand hover:text-brand-dark">
                Start over
              </button>
            </div>
          )}
          {sentences.map((sentence, i) => (
            <TranscriptRow
              key={i}
              sentence={sentence}
              index={i}
              isHighlighted={i === highlightIndex}
              activeWord={i === activeIndex ? findActiveWord(sentence, currentTime) : -1}
              isMasked={isMasked(i)}
              textSizeClass={TEXT_SIZE_CLASS[prefs.textSize]}
              showTranslation={showTranslation}
              registerRow={registerRow}
              onReplay={onReplayRow}
              onPlayFrom={onPlayFromRow}
              onWordClick={onWordClick}
            />
          ))}
          {isFollowPaused && (
            <button
              type="button"
              onClick={jumpToCurrent}
              className="btn-3d btn-brand sticky bottom-3 left-1/2 mx-auto flex -translate-x-0 animate-fade-in rounded-full px-4 py-2 text-sm"
            >
              <Icon name="chevronDown" className="size-4" />
              Back to current sentence
            </button>
          )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-line bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3.5 lg:col-start-1 lg:row-start-3 lg:self-start lg:border-0 lg:bg-transparent lg:px-6 lg:pt-5">
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
          <div className="grid grid-cols-5 gap-2 lg:max-w-xl">
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
          </div>
        )}
        <p className="mt-3 hidden text-xs text-muted lg:block">
          Shortcuts: <kbd className="font-semibold">Space</kbd> {isPractice ? "listen" : "play/pause"} ·{" "}
          <kbd className="font-semibold">← →</kbd> previous/next sentence
          {!isPractice && (
            <>
              {" "}
              · <kbd className="font-semibold">R</kbd> repeat sentence
            </>
          )}
        </p>
      </div>

      {isSettingsOpen && (
        <LessonSettingsSheet
          prefs={prefs}
          hasTranslation={lesson.hasTranslation}
          onChange={updatePrefs}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

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
