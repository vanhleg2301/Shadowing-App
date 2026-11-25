"use client";

import { useEffect, useRef, useState } from "react";
import { CourseVideoFrame, useCourseVideo } from "@/components/course/CourseVideo";
import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FocusScreen, FocusSummary } from "@/components/lesson/FocusScreen";
import type { StudySentence } from "@/lib/video-study";

interface CourseTakeTurnsProps {
  videoId: string;
  lines: StudySentence[];
  playbackRate?: number;
  onClose: () => void;
  onDone: () => void;
}

// Only the first letter of each word, so the line is said from memory with a little help.
const toHint = (text: string) =>
  text
    .split(/\s+/)
    .map((word) => word.replace(/^([^A-Za-z0-9]*[A-Za-z0-9])[A-Za-z'’]+/, "$1…"))
    .join(" ");

// The video says one line, the learner says the next, like a conversation; then they swap parts.
export function CourseTakeTurns({ videoId, lines, playbackRate = 1, onClose, onDone }: CourseTakeTurnsProps) {
  const video = useCourseVideo(videoId, lines[0]?.start ?? 0, playbackRate);
  const { isPlaying, pause, isSlow, setIsSlow } = video;
  // Which lines are the learner's: the odd ones first (the video starts), the even ones after swapping.
  const [mine, setMine] = useState<0 | 1>(1);
  const [turn, setTurn] = useState(-1);
  const [revealed, setRevealed] = useState(() => new Set<number>());
  const [rounds, setRounds] = useState(0);
  const currentRef = useRef<HTMLLIElement>(null);
  const isFinished = turn >= lines.length;
  const isMine = (i: number) => i % 2 === mine;

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turn]);

  const goTo = (next: number) => {
    pause();
    setTurn(next);
    if (next >= lines.length) {
      setRounds(rounds + 1);
      onDone();
    } else if (!isMine(next)) {
      void video.playSentence(lines[next]);
    }
  };

  const swap = () => {
    setMine(mine === 1 ? 0 : 1);
    setRevealed(new Set());
    setTurn(-1);
  };

  const reveal = (i: number) => setRevealed(new Set(revealed).add(i));

  const footer = isFinished ? null : (
    <button type="button" onClick={() => goTo(turn + 1)} className="btn-3d btn-brand w-full py-3">
      {turn < 0 ? "Start the conversation" : turn + 1 === lines.length ? "Finish" : isMine(turn + 1) ? "Your turn" : "Their turn"}
    </button>
  );

  return (
    <FocusScreen title="Take turns with the speaker" progress={Math.max(0, turn) / lines.length} onClose={onClose} footer={footer}>
      {isFinished ? (
        <FocusSummary
          title="Nice conversation!"
          detail={rounds < 2 ? "Now swap parts: say the lines the video said." : "You've said every line. Saying them from memory is how they become yours."}
        >
          <button type="button" onClick={swap} className={`btn-3d py-3 ${rounds < 2 ? "btn-brand" : ""}`}>
            Swap parts
          </button>
          <button type="button" onClick={onClose} className="btn-3d py-3">
            Back to the day
          </button>
        </FocusSummary>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            Take turns · {mine === 1 ? "the video starts" : "you start"}
          </p>
          <p className="mt-1 text-sm text-muted">The video says one line, you say the next. Your lines show only their first letters: say them, then check.</p>
        </>
      )}
      {/* Kept mounted after the end, so the player still works after swapping parts. */}
      <CourseVideoFrame video={video} className={isFinished ? "hidden" : "mt-3"} />
      {!isFinished && (
        <>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={isPlaying ? pause : () => turn >= 0 && void video.playSentence(lines[turn])}
              disabled={turn < 0}
              className="btn-3d flex-1 px-4 py-2.5 text-sm disabled:opacity-40"
            >
              <Icon name={isPlaying ? "pause" : "repeat"} className="size-4" />
              {isPlaying ? "Pause" : "Hear this line"}
            </button>
            <button type="button" onClick={() => setIsSlow(!isSlow)} aria-pressed={isSlow} className={`btn-3d px-4 py-2.5 text-sm ${isSlow ? "border-brand text-brand" : ""}`}>
              Slower
            </button>
          </div>
          <ol className="mt-4 flex flex-col gap-3" aria-label="Conversation">
            {lines.slice(0, turn + 1).map((line, i) => {
              const isCurrent = i === turn;
              if (!isMine(i)) {
                return (
                  <li key={i} ref={isCurrent ? currentRef : undefined} className="max-w-[85%] self-start rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
                    <p className="text-xs font-bold text-muted">Video</p>
                    <p lang="en" className="text-lg leading-snug text-ink">
                      {line.text}
                    </p>
                  </li>
                );
              }
              const isShown = revealed.has(i) || !isCurrent;
              return (
                <li key={i} ref={isCurrent ? currentRef : undefined} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-brand-soft px-4 py-3">
                  <p className="text-xs font-bold text-brand">You</p>
                  <p lang="en" className={`text-lg leading-snug ${isShown ? "text-ink" : "text-muted"}`}>
                    {isShown ? line.text : toHint(line.text)}
                  </p>
                  {isCurrent && (
                    <div className="mt-2">
                      {!revealed.has(i) && (
                        <button type="button" onClick={() => reveal(i)} className="mb-2 text-sm font-semibold text-brand">
                          Show the line
                        </button>
                      )}
                      <VoiceRecorder
                        key={`${mine}-${i}`}
                        target={line.text}
                        onPlayOriginal={() => video.playSentence(line)}
                        originalDurationSec={line.end - line.start}
                        onBeforeRecord={pause}
                        onRecorded={() => reveal(i)}
                        recordLabel="Say your line"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </FocusScreen>
  );
}
