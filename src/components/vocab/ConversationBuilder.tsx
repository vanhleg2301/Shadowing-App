"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import type { DialogueLine } from "@/data/vocabulary";
import { getPassScore, shuffle } from "@/lib/day-test";
import { speak } from "@/lib/speech";

interface ConversationBuilderProps {
  you: string;
  lines: DialogueLine[];
  seed: number;
  onPass: () => void;
}

const RATE = 0.85;

// The conversation plays line by line. At each of the learner's turns they choose what comes next from
// the context, then hear it said, so the whole conversation is built one guess at a time.
export function ConversationBuilder({ you, lines, seed, onPass }: ConversationBuilderProps) {
  const turns = useMemo(() => lines.flatMap((line, i) => (line.speaker === you ? [i] : [])), [lines, you]);
  const options = useMemo(
    () =>
      turns.map((index, n) => {
        const others = shuffle(
          turns.filter((t) => t !== index).map((t) => lines[t].text),
          seed + n,
        ).slice(0, 2);
        return shuffle([lines[index].text, ...others], seed + n + 40);
      }),
    [turns, lines, seed],
  );
  const speakers = useMemo(() => [...new Set(lines.map((line) => line.speaker))], [lines]);
  const [answered, setAnswered] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(-1);
  const runRef = useRef(0);

  const isFinished = answered >= turns.length;
  const turn = turns[answered];
  // Everything before the current turn is on screen; once picked, the turn's line is too.
  const shownCount = isFinished ? lines.length : picked ? turn + 1 : turn;
  const passScore = getPassScore(turns.length);

  useEffect(
    () => () => {
      runRef.current++;
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const play = (from: number, to: number) => {
    const run = ++runRef.current;
    const next = (index: number) => {
      if (run !== runRef.current) return;
      if (index >= to) {
        setPlaying(-1);
        return;
      }
      setPlaying(index);
      speak(lines[index].text, speakers.indexOf(lines[index].speaker) % 2 === 0 ? "us" : "uk", RATE, () => next(index + 1));
    };
    next(from);
  };

  const stop = () => {
    runRef.current++;
    window.speechSynthesis?.cancel();
    setPlaying(-1);
  };

  const handlePick = (option: string) => {
    if (picked) return;
    setPicked(option);
    if (option === lines[turn].text) setScore((s) => s + 1);
    play(turn, turn + 1);
  };

  const handleNext = () => {
    const nextAnswered = answered + 1;
    setPicked(null);
    setAnswered(nextAnswered);
    const nextTurn = turns[nextAnswered] ?? lines.length;
    // The other person's lines up to the learner's next turn.
    if (nextTurn > turn + 1) play(turn + 1, nextTurn);
    if (nextAnswered >= turns.length && score >= passScore) onPass();
  };

  const start = () => {
    if (turns[0] > 0) play(0, turns[0]);
  };

  const restart = () => {
    stop();
    setAnswered(0);
    setPicked(null);
    setScore(0);
    start();
  };

  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-muted">
        <span>
          You are <b className="text-ink">{you}</b>
        </span>
        <span>
          Score {score}/{turns.length}
        </span>
      </div>

      <ol lang="en" className="mt-3 space-y-2">
        {lines.slice(0, shownCount).map((line, i) => {
          const isYou = line.speaker === you;
          return (
            <li key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
              <button
                type="button"
                onClick={() => play(i, i + 1)}
                aria-label={`Listen: ${line.text}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-left leading-snug transition-colors ${
                  isYou ? "bg-brand text-on-brand" : "border border-line bg-surface text-ink"
                } ${playing === i ? "ring-2 ring-accent" : ""}`}
              >
                <span className={`block text-[11px] font-bold uppercase tracking-wide ${isYou ? "text-on-brand/80" : "text-accent"}`}>{line.speaker}</span>
                {line.text}
              </button>
            </li>
          );
        })}
      </ol>

      {answered === 0 && !picked && turns[0] > 0 && (
        <button type="button" onClick={start} className="btn-3d mt-3 px-4 py-2 text-sm">
          <Icon name="volume" className="size-4" />
          Listen to the start
        </button>
      )}

      {!isFinished ? (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">What does {you} say next?</p>
          <ul lang="en" className="mt-2 grid grid-cols-1 gap-2">
            {options[answered].map((option) => {
              const isAnswer = option === lines[turn].text;
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
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className={`font-semibold ${picked === lines[turn].text ? "text-brand" : "text-red-600"}`}>
                {picked === lines[turn].text ? "Correct!" : "Not quite. The right line is marked."}
              </p>
              <button type="button" onClick={handleNext} className="btn-3d btn-brand shrink-0 px-4 py-2 text-sm">
                {answered + 1 === turns.length ? "See score" : "Next"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-3xl font-extrabold text-ink">
            {score}/{turns.length}
          </p>
          <p className={`mt-1 font-semibold ${score >= passScore ? "text-brand" : "text-muted"}`}>
            {score >= passScore ? "Passed! Now play it all and say your lines with the voice." : `You need ${passScore} to pass. Try once more.`}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => (playing >= 0 ? stop() : play(0, lines.length))} className="btn-3d btn-brand px-4 py-2 text-sm">
              <Icon name={playing >= 0 ? "stop" : "volume"} className="size-4" />
              {playing >= 0 ? "Stop" : "Play the whole conversation"}
            </button>
            <button type="button" onClick={restart} className="btn-3d px-4 py-2 text-sm">
              <Icon name="repeat" className="size-4" />
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
