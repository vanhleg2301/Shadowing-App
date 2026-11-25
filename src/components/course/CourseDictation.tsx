"use client";

import Image from "next/image";
import { useEffect, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/Icon";
import { FocusScreen, FocusSummary } from "@/components/lesson/FocusScreen";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { getHostedMedia } from "@/lib/media";
import { checkDictation, type WordResult } from "@/lib/practice";
import type { StudySentence } from "@/lib/video-study";

interface CourseDictationProps {
  videoId: string;
  sentences: StudySentence[];
  playbackRate?: number;
  onClose: () => void;
  onDone: () => void;
}

const SLOW_RATE = 0.75;
const PASS_SCORE = 70;

// Hear a sentence from the day's video, type it, then see which words were missed.
export function CourseDictation({ videoId, sentences, playbackRate = 1, onClose, onDone }: CourseDictationProps) {
  const media = getHostedMedia(videoId);
  const youTube = useYouTubePlayer(media ? null : videoId, sentences[0]?.start ?? 0, { hideCaptions: true });
  const audio = useAudioPlayer(media?.audioUrl ?? null, sentences[0]?.start ?? 0);
  const { containerRef } = youTube;
  const { isPlaying, playSegment, pause, setRate } = media ? audio : youTube;
  const [isSlow, setIsSlow] = useState(playbackRate < 1);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ words: WordResult[]; score: number } | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const isFinished = index >= sentences.length;
  const sentence = sentences[index];

  useEffect(() => {
    setRate(isSlow ? Math.min(playbackRate, SLOW_RATE) : playbackRate);
  }, [isSlow, playbackRate, setRate]);

  const play = () => {
    if (sentence) void playSegment(sentence.start, sentence.end);
  };

  const check = () => {
    if (!sentence || !typed.trim()) return;
    const checked = checkDictation(sentence.text, typed);
    setResult(checked);
    setScores([...scores, checked.score]);
  };

  const next = () => {
    pause();
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setTyped("");
    setResult(null);
    if (nextIndex >= sentences.length) onDone();
  };

  const restart = () => {
    setIndex(0);
    setScores([]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      check();
    }
  };

  const average = scores.length ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;

  const footer = isFinished ? null : result ? (
    <button type="button" onClick={next} className="btn-3d btn-brand w-full py-3">
      {index + 1 === sentences.length ? "Finish" : "Next sentence"}
    </button>
  ) : (
    <div className="flex gap-3">
      <button type="button" onClick={() => setResult(checkDictation(sentence.text, ""))} className="btn-3d flex-1 py-3">
        Show it
      </button>
      <button type="button" onClick={check} disabled={!typed.trim()} className="btn-3d btn-brand flex-[2] py-3 disabled:opacity-40">
        Check
      </button>
    </div>
  );

  return (
    <FocusScreen title="Write what you hear" progress={index / sentences.length} onClose={onClose} footer={footer}>
      {isFinished ? (
        <FocusSummary
          title={`${average}% heard right`}
          isPassed={average >= PASS_SCORE}
          detail={
            average >= PASS_SCORE
              ? "Your ears are catching the words. The ones you missed are usually the short, quick ones: listen for them when you shadow."
              : "That's normal: the short words run together in real speech. Shadowing these sentences is what trains your ear."
          }
        >
          <button type="button" onClick={restart} className="btn-3d py-3">
            Try them again
          </button>
          <button type="button" onClick={onClose} className="btn-3d py-3">
            Back to the day
          </button>
        </FocusSummary>
      ) : (
        <p className="text-xs font-bold uppercase tracking-wide text-accent">
          Write what you hear · {index + 1} of {sentences.length}
        </p>
      )}
      {/* Kept mounted after the last sentence, so the player still works for "Try them again". */}
      <div className={`relative mt-3 aspect-video w-full overflow-hidden rounded-2xl bg-black ${isFinished ? "hidden" : ""}`}>
        {media ? (
          <Image src={media.imageUrl} alt="" fill sizes="42rem" className="object-cover opacity-80" />
        ) : (
          <>
            {/* Until the first play loads the player. */}
            <Image src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" fill sizes="42rem" className="object-cover opacity-80" />
            <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          </>
        )}
      </div>
      {!isFinished && (
        <>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={isPlaying ? pause : play} className="btn-3d btn-brand flex-1 px-4 py-2.5 text-sm">
              <Icon name={isPlaying ? "pause" : "play"} className="size-4" />
              {isPlaying ? "Pause" : "Play the sentence"}
            </button>
            <button type="button" onClick={() => setIsSlow(!isSlow)} aria-pressed={isSlow} className={`btn-3d px-4 py-2.5 text-sm ${isSlow ? "border-brand text-brand" : ""}`}>
              Slower
            </button>
          </div>
          <textarea
            key={index}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={result !== null}
            rows={3}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="What you heard"
            placeholder="Play it as many times as you like, then type what you hear"
            className="mt-3 w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-lg text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
          {result && (
            <div className="mt-2 animate-fade-in rounded-2xl border border-line bg-surface p-4">
              <p className={`text-sm font-bold ${result.score === 100 ? "text-brand" : "text-accent"}`}>
                {result.score === 100 ? "Perfect!" : typed.trim() ? `${result.score}% heard right. The red words are the ones you missed.` : "Here it is. Play it again and listen for each word."}
              </p>
              <p lang="en" className="mt-2 text-lg leading-relaxed">
                {result.words.map((w, i) => (
                  <span key={i} className={w.isCorrect ? "text-ink" : "rounded bg-red-100 px-0.5 text-red-700 dark:bg-red-500/20 dark:text-red-300"}>
                    {w.text}{" "}
                  </span>
                ))}
              </p>
              {sentence.translation && <p className="mt-1 text-sm text-muted">{sentence.translation}</p>}
            </div>
          )}
        </>
      )}
    </FocusScreen>
  );
}
