"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import type { CourseDialogue } from "@/data/course-a2-dialogues";
import { speak } from "@/lib/speech";

interface RolePlayProps {
  dialogue: CourseDialogue;
  onComplete: () => void;
}

// The app reads the partner's lines; the learner records each of their own lines in turn.
export function RolePlay({ dialogue, onComplete }: RolePlayProps) {
  const [step, setStep] = useState(-1);
  const [isHidden, setIsHidden] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playToken = useRef(0);
  const { lines } = dialogue;
  const isFinished = step >= lines.length;
  const current = step >= 0 && !isFinished ? lines[step] : null;

  const playPartner = (index: number) => {
    const token = ++playToken.current;
    setIsSpeaking(true);
    speak(lines[index].text, "uk", 0.9, () => {
      if (token === playToken.current) goTo(index + 1);
    });
  };

  const goTo = (index: number) => {
    playToken.current++;
    setIsSpeaking(false);
    setStep(index);
    if (index >= lines.length) {
      onComplete();
      return;
    }
    if (lines[index].speaker === "partner") playPartner(index);
  };

  useEffect(() => () => void playToken.current++, []);

  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      <p className="text-sm text-muted">
        <b className="text-ink">Scene:</b> {dialogue.setting} The app plays the <b>{dialogue.partnerRole.toLowerCase()}</b>; you say the
        highlighted lines.
      </p>

      <ol lang="en" className="mt-4 space-y-2">
        {lines.map((line, i) => {
          if (i > step && !isFinished) return null;
          const isYou = line.speaker === "you";
          const isActive = i === step;
          const showText = !isYou || !isHidden || i < step || isFinished;
          return (
            <li key={i} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  isYou ? "bg-brand text-on-brand" : "border border-line bg-surface text-ink"
                } ${isActive ? "ring-2 ring-accent" : ""}`}
              >
                <p className="text-xs font-bold opacity-70">{isYou ? "You" : dialogue.partnerRole}</p>
                <p className="leading-snug">{showText ? line.text : "Say your line from memory..."}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        {step === -1 && (
          <button type="button" onClick={() => goTo(0)} className="btn-3d btn-brand px-5 py-2.5">
            <Icon name="play" className="size-4" />
            Start role-play
          </button>
        )}

        {current?.speaker === "partner" && (
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-muted">{isSpeaking ? `${dialogue.partnerRole} is speaking...` : ""}</p>
            <button type="button" onClick={() => goTo(step + 1)} className="btn-3d px-4 py-2 text-sm">
              Skip
            </button>
          </div>
        )}

        {current?.speaker === "you" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => speak(current.text, "uk")} className="btn-3d px-3 py-2 text-sm">
                <Icon name="volume" className="size-4" />
                Hear it
              </button>
              <button type="button" onClick={() => setIsHidden((v) => !v)} className="btn-3d px-3 py-2 text-sm">
                {isHidden ? "Show my lines" : "Hide my lines"}
              </button>
              <button type="button" onClick={() => goTo(step + 1)} className="btn-3d btn-brand px-4 py-2 text-sm">
                Next
                <Icon name="next" className="size-4" />
              </button>
            </div>
            <VoiceRecorder key={step} target={current.text} recordLabel="Record your line" />
          </div>
        )}

        {isFinished && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold text-brand">Well done! Try again with your lines hidden.</p>
            <button type="button" onClick={() => goTo(0)} className="btn-3d px-4 py-2 text-sm">
              <Icon name="repeat" className="size-4" />
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
