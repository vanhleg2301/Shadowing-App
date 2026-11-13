"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { BLANK, getPassScore, type TestQuestion } from "@/lib/day-test";
import { getHostedMedia } from "@/lib/media";
import { speak } from "@/lib/speech";

interface DayTestProps {
  questions: TestQuestion[];
  // The day's main video, for the listening questions.
  videoId: string | null;
  onPass: () => void;
  passMessage?: string;
  // The label above questions about the content.
  meaningLabel?: string;
}

const HINTS: Record<TestQuestion["kind"], string> = {
  listen: "Listen. Which sentence did you hear?",
  gap: "",
  meaning: "About the video",
};

export function DayTest({ questions, videoId, onPass, passMessage = "Passed! This day is done.", meaningLabel = "About the video" }: DayTestProps) {
  const media = videoId ? getHostedMedia(videoId) : null;
  // Both hooks are always called; only the one matching the video's media mounts a player.
  const youTube = useYouTubePlayer(media || !videoId ? null : videoId, 0, { hideCaptions: true });
  const audio = useAudioPlayer(media?.audioUrl ?? null);
  const { containerRef } = youTube;
  const player = media ? audio : youTube;
  const hasListening = questions.some((q) => q.kind === "listen");

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const isFinished = index >= questions.length;
  const question = questions[index];
  const passScore = getPassScore(questions.length);

  const playQuestion = (q: TestQuestion) => {
    if (q.kind === "listen") void player.playSegment(q.sentence.start, q.sentence.end);
  };

  const handlePick = (option: string) => {
    if (picked) return;
    setPicked(option);
    if (option === question.answer) setScore((s) => s + 1);
    if (question.kind === "gap") speak(question.prompt.includes(BLANK) ? question.prompt.replace(BLANK, question.answer) : question.answer, "uk");
  };

  const handleNext = () => {
    const next = index + 1;
    setPicked(null);
    setIndex(next);
    if (next >= questions.length) {
      if (score >= passScore) onPass();
      return;
    }
    playQuestion(questions[next]);
  };

  const handleRestart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    playQuestion(questions[0]);
  };

  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      {/* The video stays on screen for the listening questions: it is what plays them. */}
      {hasListening && (
        <div className={`relative mx-auto mb-4 aspect-video w-full max-w-sm overflow-hidden rounded-2xl bg-black ${question?.kind === "listen" ? "" : "hidden"}`}>
          {media ? (
            <Image src={media.imageUrl} alt="" fill sizes="24rem" className="object-cover opacity-80" />
          ) : (
            <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          )}
        </div>
      )}

      {isFinished ? (
        <div className="text-center">
          <p className="text-3xl font-extrabold text-ink">
            {score}/{questions.length}
          </p>
          <p className={`mt-1 font-semibold ${score >= passScore ? "text-brand" : "text-muted"}`}>
            {score >= passScore ? passMessage : `You need ${passScore} to pass. Go back over it once more, then retry.`}
          </p>
          <button type="button" onClick={handleRestart} className="btn-3d mt-4 px-4 py-2 text-sm">
            <Icon name="repeat" className="size-4" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm font-semibold text-muted">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>Score {score}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-accent">{question.kind === "gap" ? question.hint : question.kind === "meaning" ? meaningLabel : HINTS[question.kind]}</p>
          {question.kind === "listen" ? (
            <button type="button" onClick={() => playQuestion(question)} className="btn-3d btn-brand mt-2 px-4 py-2 text-sm">
              <Icon name={player.isPlaying ? "pause" : "play"} className="size-4" />
              {player.isPlaying ? "Playing…" : "Play the sentence"}
            </button>
          ) : (
            <>
              {question.kind === "meaning" && question.image && (
                <Image src={question.image} alt="" width={240} height={240} className="mt-2 size-40 rounded-2xl border border-line sm:size-48" />
              )}
              <p lang="en" className="mt-1 text-lg font-bold leading-snug text-ink">
                {question.prompt}
              </p>
            </>
          )}
          <ul lang="en" className={`mt-4 grid grid-cols-1 gap-2 ${question.kind === "listen" ? "" : "sm:grid-cols-2"}`}>
            {question.options.map((option) => {
              const isAnswer = option === question.answer;
              const state = !picked
                ? "border-line bg-surface hover:border-brand"
                : isAnswer
                  ? "border-brand bg-brand-soft"
                  : option === picked
                    ? "border-red-400 bg-red-50 dark:bg-red-950/40"
                    : "border-line bg-surface opacity-60";
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => handlePick(option)}
                    disabled={picked !== null}
                    className={`min-h-12 w-full rounded-xl border-2 px-3 py-2 text-left font-semibold text-ink transition-colors ${state}`}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
          {picked && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className={`font-semibold ${picked === question.answer ? "text-brand" : "text-red-600"}`}>
                {picked === question.answer ? "Correct!" : question.kind === "listen" ? "Not quite. The right one is marked." : `Answer: ${question.answer}`}
              </p>
              <button type="button" onClick={handleNext} className="btn-3d btn-brand shrink-0 px-4 py-2 text-sm">
                {index + 1 === questions.length ? "See score" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
