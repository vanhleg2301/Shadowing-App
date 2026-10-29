"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type UIEvent } from "react";
import { recordProgress } from "@/app/actions";
import { ClozePanel } from "@/components/ClozePanel";
import { DictationPanel } from "@/components/DictationPanel";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Icon } from "@/components/Icon";
import { LessonSettingsSheet } from "@/components/LessonSettingsSheet";
import { PartNav } from "@/components/PartNav";
import { ShadowingPanel } from "@/components/ShadowingPanel";
import { StudyTimer } from "@/components/StudyTimer";
import { SummaryPanel } from "@/components/SummaryPanel";
import { TranscriptRow } from "@/components/TranscriptRow";
import { VideoFacade } from "@/components/VideoFacade";
import { WordLookupSheet } from "@/components/WordLookupSheet";
import { useAuth } from "@/hooks/useAuth";
import { useLessonPrefs, type TextSize } from "@/hooks/useLessonPrefs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { findActiveIndex, findActiveWord, type Lesson } from "@/lib/lesson";
import type { LessonPart } from "@/lib/lesson-parts";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getLessonTrail } from "@/lib/lesson-trail";

const SPEEDS = [0.5, 0.75, 1, 1.25];
// Progress is saved at most this often while the learner moves through sentences.
const PROGRESS_INTERVAL_MS = 10000;

const TEXT_SIZE_CLASS: Record<TextSize, string> = {
  sm: "text-[15px]",
  md: "text-base",
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
  // Course links can open the lesson slower (the Gentle plan uses 0.75x).
  initialRate?: number;
  // Set when a long video is studied in parts; lesson.sentences then holds only this part.
  part?: LessonPart;
  partQuery?: string;
}

export function LessonPlayer({
  lesson,
  initialIsFavorite,
  initialSavedWords,
  initialSentence,
  initialMode = "watch",
  isListenFirst = false,
  backHref = "/",
  initialRate = 1,
  part,
  partQuery = "",
}: LessonPlayerProps) {
  const { user } = useAuth();
  const { lookup, openWord, sheetProps } = useWordLookup(lesson.videoId, initialSavedWords);
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
  // True while one sentence is playing on purpose, so the stop-at-sentence-end guard stays out of the way.
  const isSegmentPlayingRef = useRef(false);
  const lastProgressAtRef = useRef(0);
  // In dictation and cloze the transcript stays hidden until the learner has answered that sentence.
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [speed, setSpeed] = useState(initialRate);
  const { prefs, updatePrefs } = useLessonPrefs();
  const showTranslation = lesson.hasTranslation && prefs.showTranslation;
  const [isSessionListenFirst, setIsSessionListenFirst] = useState(isListenFirst);
  const isHideText = prefs.hideText || isSessionListenFirst;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [panel, setPanel] = useState<"transcript" | "summary">("transcript");
  const [isFollowPaused, setIsFollowPaused] = useState(false);
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
    if (initialRate !== 1) setRate(initialRate);
    // Only on open; the speed button changes it afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPlaying) hasInteractedRef.current = true;
  }, [isPlaying]);

  // Throttled save of where the learner is; skipped until they actually play or practise.
  useEffect(() => {
    if (!user || !hasInteractedRef.current) return;
    const wait = Math.max(0, PROGRESS_INTERVAL_MS - (Date.now() - lastProgressAtRef.current));
    const id = setTimeout(() => {
      lastProgressAtRef.current = Date.now();
      recordProgress({
        videoId: lesson.videoId,
        sentenceIndex: currentIndex + (part?.offset ?? 0),
        sentenceCount: part?.sentenceCount ?? sentences.length,
      });
    }, wait);
    return () => clearTimeout(id);
  }, [currentIndex, user, lesson.videoId, sentences.length, part?.offset, part?.sentenceCount]);

  // In shadow, dictation and cloze the video must stop where the practised sentence ends, even when playback
  // was started from the video itself (its play button or YouTube's own controls), so the learner can answer.
  const practiceEnd = isPractice ? sentences[practiceIndex]?.end : undefined;
  useEffect(() => {
    if (practiceEnd === undefined || !isPlaying || loopIndex !== null || isSegmentPlayingRef.current) return;
    if (currentTime >= practiceEnd) pause();
  }, [practiceEnd, currentTime, isPlaying, loopIndex, pause]);

  // A part ends where its last sentence ends, not where the video does.
  const partEnd = part ? sentences[sentences.length - 1].end : null;
  const isPartOver = partEnd !== null && currentTime >= partEnd + 0.3;
  useEffect(() => {
    if (isPartOver && isPlaying && loopIndex === null) pause();
  }, [isPartOver, isPlaying, loopIndex, pause]);
  const partHref = (index: number) => `/watch/${lesson.videoId}?${partQuery ? `${partQuery}&` : ""}part=${index}`;

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

  const playOneSentence = async (index: number): Promise<void> => {
    isSegmentPlayingRef.current = true;
    try {
      await playSegment(sentences[index].start, sentences[index].end);
    } finally {
      isSegmentPlayingRef.current = false;
    }
  };

  const playSentence = (index: number): Promise<void> => {
    if (isPractice) return playOneSentence(index);
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
    void playOneSentence(index);
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
    seekTo(sentences[0]?.start ?? 0);
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

  const handleWordClick = (token: string, sentence: string) => {
    if (openWord(token, sentence)) pause();
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
  useMediaSession({
    title: lesson.media ? (isHideText ? lesson.title : (sentences[currentIndex]?.text ?? lesson.title)) : null,
    artist: lesson.title,
    artworkUrl: lesson.media?.imageUrl,
    isPlaying,
    onPlay: play,
    onPause: pause,
    onPrevious: () => goToSentence(currentIndex - 1),
    onNext: () => goToSentence(currentIndex + 1),
    onSeekBackward: () => seekTo(Math.max(0, currentTime - 5)),
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => shortcutRef.current(event);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-7xl flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-[auto_auto_1fr]">
      <StudyTimer isBusy={isPlaying} />
      <header className="relative flex items-center gap-2 border-b border-line bg-cream px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] sm:px-4 lg:col-span-2 lg:flex-nowrap lg:gap-3 lg:px-6 lg:py-3">
        <Link href={backHref} aria-label={backHref === "/" ? "Back to home" : "Back to the course"} className="btn-3d size-10 shrink-0 rounded-full">
          <Icon name="back" />
        </Link>
        <div className="min-w-0 flex-1">
          {/* Desktop only: on phones the back button is enough and the video keeps the space. */}
          <Breadcrumbs items={getLessonTrail(backHref)} className="hidden lg:block" />
          <h1 className="truncate font-bold text-ink">{lesson.title}</h1>
          <p className="truncate text-sm text-muted">{part ? `Part ${part.index} of ${part.total} · ${lesson.author}` : lesson.author}</p>
        </div>
        {/* Phones get the modes as a compact menu so the header stays one row and the video sits higher. */}
        <select
          value={mode}
          onChange={(event) => handleModeChange(event.target.value as Mode)}
          aria-label="Lesson mode"
          className="h-10 shrink-0 rounded-full border border-line bg-surface px-3 text-sm font-bold text-ink outline-none focus:border-brand lg:hidden"
        >
          {MODES.map((m) => (
            <option key={m.mode} value={m.mode}>
              {m.label}
            </option>
          ))}
        </select>
        <FavoriteButton videoId={lesson.videoId} title={lesson.title} initialIsFavorite={initialIsFavorite} />
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Display settings"
          className="btn-3d size-10 shrink-0 rounded-full text-sm font-extrabold"
        >
          Aa
        </button>
        <div className="no-scrollbar hidden gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1 lg:flex lg:w-auto lg:shrink-0">
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

      {/* Listening comes first: on phones, while watching, the video and the sentence being spoken
          take more of the screen than the transcript list. */}
      <div className={`flex flex-col lg:flex-none lg:px-6 lg:pt-6 ${mode === "watch" ? "min-h-0 flex-[3]" : "shrink-0"}`}>
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black lg:rounded-3xl lg:shadow-[0_4px_0_0_var(--color-line)]">
          {lesson.media ? (
            <button
              type="button"
              onClick={isPlaying ? pause : isPractice ? () => void playSentence(practiceIndex) : play}
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
            <>
              <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
              {!youTube.isActivated && <VideoFacade videoId={lesson.videoId} onPlay={isPractice ? () => void playSentence(practiceIndex) : play} />}
            </>
          )}
          {!isReady && (
            <p className="absolute inset-0 grid place-items-center text-sm text-white/60">Loading video...</p>
          )}
        </div>
        {mode === "watch" && (
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden border-b border-line bg-surface px-5 py-3 text-center lg:hidden">
            {isHideText ? (
              <p className="text-sm font-semibold text-muted">Listen first. The text is hidden.</p>
            ) : (
              <p key={currentIndex} className="line-clamp-4 animate-fade-in text-xl font-bold leading-snug text-ink">
                {sentences[currentIndex]?.text}
              </p>
            )}
          </div>
        )}
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
          {part && (
            <PartNav index={part.index} total={part.total} href={partHref} isOver={isPartOver} />
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

      {sheetProps && <WordLookupSheet {...sheetProps} />}
    </div>
  );
}
