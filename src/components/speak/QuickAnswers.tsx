"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { FocusScreen, FocusSummary } from "@/components/lesson/FocusScreen";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { QUICK_SESSION_SIZE, type QuickTopic } from "@/data/quick-answers";
import { useLinePlayer } from "@/hooks/useLinePlayer";
import { useRecorder } from "@/hooks/useRecorder";
import type { LineNarration } from "@/lib/story-audio";

interface QuickAnswersProps {
  topic: QuickTopic;
  narration: LineNarration | null;
  onClose: () => void;
  onDone?: () => void;
}

const ANSWER_SECONDS = 15;

type Phase = "ready" | "asking" | "answering" | "review";

const stuckKey = (topic: QuickTopic) => `quick-stuck:${topic.slug}`;

// Questions the learner got stuck on last time, kept on this device to come back first.
function readStuck(topic: QuickTopic): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(stuckKey(topic)) ?? "[]");
    return Array.isArray(value) ? value.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < topic.questions.length) : [];
  } catch {
    return [];
  }
}

function writeStuck(topic: QuickTopic, stuck: number[]) {
  try {
    localStorage.setItem(stuckKey(topic), JSON.stringify(stuck));
  } catch {
    // Only a convenience: the next session just starts in the usual order.
  }
}

// The stuck ones first, then the rest, starting at a different place each day so every question comes up.
function pickSession(topic: QuickTopic): number[] {
  const stuck = readStuck(topic);
  const start = Math.floor(Date.now() / 86_400_000) % topic.questions.length;
  const rest = topic.questions.map((_, i) => (start + i) % topic.questions.length).filter((i) => !stuck.includes(i));
  return [...stuck, ...rest].slice(0, QUICK_SESSION_SIZE);
}

// Speaking reflex: a question is asked out loud, the learner answers at once while it records, then hears a model
// answer and says it. Questions they got stuck on come back at the end and first next time.
export function QuickAnswers({ topic, narration, onClose, onDone }: QuickAnswersProps) {
  const [queue, setQueue] = useState(() => pickSession(topic));
  const [position, setPosition] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [isQuestionShown, setIsQuestionShown] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [stuck, setStuck] = useState<number[]>([]);
  const { playLine, stop: stopPlaying, isPlaying, audioProps } = useLinePlayer(narration);
  const { isRecording, audioBlob, error, seconds, transcript, start, stop } = useRecorder({ transcribe: true });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFinished = position >= queue.length;
  const index = queue[position];
  const item = topic.questions[index];

  const finishAnswer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    stop();
    setPhase("review");
  };

  const beginAnswer = async () => {
    setPhase("answering");
    await start();
    timerRef.current = setTimeout(finishAnswer, ANSWER_SECONDS * 1000);
  };

  const ask = () => {
    setPhase("asking");
    playLine(index * 2, item.question, () => void beginAnswer());
  };

  const next = (wasAnswered: boolean) => {
    stopPlaying();
    const nextStuck = wasAnswered ? stuck : [...new Set([...stuck, index])];
    if (wasAnswered) setAnswered(answered + 1);
    else setStuck(nextStuck);
    // A stuck question comes back once at the end of this session.
    const nextQueue = !wasAnswered && queue.indexOf(index) === position ? [...queue, index] : queue;
    setQueue(nextQueue);
    setPosition(position + 1);
    setPhase("ready");
    setIsQuestionShown(false);
    if (position + 1 >= nextQueue.length) {
      writeStuck(topic, nextStuck);
      onDone?.();
    }
  };

  const restart = () => {
    setQueue(pickSession(topic));
    setPosition(0);
    setAnswered(0);
    setStuck([]);
    setPhase("ready");
  };

  const footer = isFinished ? null : phase === "review" ? (
    <div className="flex gap-3">
      <button type="button" onClick={() => next(false)} className="btn-3d flex-1 py-3">
        I got stuck
      </button>
      <button type="button" onClick={() => next(true)} className="btn-3d btn-brand flex-1 py-3">
        I answered
      </button>
    </div>
  ) : phase === "answering" ? (
    <button type="button" onClick={finishAnswer} className="btn-3d btn-brand w-full py-3">
      I&apos;ve finished
    </button>
  ) : phase === "asking" ? (
    // For when the learner has the question before it ends, or the browser's voice never says it has finished.
    <button
      type="button"
      onClick={() => {
        stopPlaying();
        void beginAnswer();
      }}
      className="btn-3d w-full py-3"
    >
      Answer now
    </button>
  ) : (
    <button type="button" onClick={ask} className="btn-3d btn-brand w-full py-3">
      <Icon name="volume" className="size-5" />
      {position === 0 ? "Ask me" : "Next question"}
    </button>
  );

  return (
    <FocusScreen title="Quick answers" progress={position / queue.length} onClose={onClose} footer={footer}>
      <audio {...audioProps} />
      {isFinished ? (
        <FocusSummary
          title={`${answered} answered`}
          detail={
            stuck.length > 0
              ? `${stuck.length} ${stuck.length === 1 ? "question" : "questions"} will come back first next time. Speed comes from doing this every day.`
              : "No pauses! Speed comes from doing this every day."
          }
        >
          <button type="button" onClick={restart} className="btn-3d btn-brand py-3">
            Go again
          </button>
          <button type="button" onClick={onClose} className="btn-3d py-3">
            Back
          </button>
        </FocusSummary>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">
            {topic.topic} · {position + 1} of {queue.length}
          </p>
          {phase === "ready" && (
            <p className="mt-6 text-lg text-ink">
              You&apos;ll hear a question. Answer straight away, out loud, in a full sentence. Don&apos;t worry about mistakes: speed matters more
              here.
            </p>
          )}
          {(phase === "asking" || phase === "answering") && (
            <div className="mt-6 text-center">
              {phase === "answering" ? (
                <>
                  <span className="mx-auto grid size-20 animate-pulse place-items-center rounded-full bg-red-600 text-white">
                    <Icon name="mic" className="size-9" />
                  </span>
                  <p className="mt-3 text-3xl font-extrabold text-ink">{Math.max(0, ANSWER_SECONDS - seconds)}</p>
                  <p className="text-sm text-muted">{isRecording ? "Answer now" : "Starting the microphone…"}</p>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </>
              ) : (
                <>
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-soft text-brand">
                    <Icon name="volume" className="size-9" />
                  </span>
                  <p className="mt-3 text-sm text-muted">{isPlaying ? "Listen to the question" : "…"}</p>
                </>
              )}
              {isQuestionShown ? (
                <p lang="en" className="mt-4 text-xl font-semibold text-ink">
                  {item.question}
                </p>
              ) : (
                <button type="button" onClick={() => setIsQuestionShown(true)} className="mt-4 text-sm font-semibold text-brand">
                  Show the question
                </button>
              )}
            </div>
          )}
          {phase === "review" && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">The question</p>
                <p lang="en" className="mt-1 text-xl font-semibold text-ink">
                  {item.question}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">You said</p>
                <p lang="en" className="mt-1 text-ink">
                  {transcript || <span className="text-muted">{audioBlob ? "(Play your answer below.)" : "(Nothing was recorded.)"}</span>}
                </p>
                {audioBlob && (
                  <div className="mt-3">
                    <RecordingPlayer blob={audioBlob} label="Play your answer" />
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-brand/30 bg-brand-soft p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand">A model answer</p>
                    <p lang="en" className="mt-1 text-lg font-semibold text-ink">
                      {item.answer}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playLine(index * 2 + 1, item.answer)}
                    aria-label="Hear the model answer"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-brand"
                  >
                    <Icon name="volume" className="size-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-muted">Hear it, then say it once out loud. Then say your own answer again, a little faster.</p>
              </div>
            </div>
          )}
        </>
      )}
    </FocusScreen>
  );
}
