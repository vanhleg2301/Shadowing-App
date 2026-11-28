"use client";

import { useEffect, useState } from "react";
import { speak } from "@/lib/speech";
import type { LineNarration } from "@/lib/story-audio";

const FALLBACK_RATE = 0.9;

function playFrom(audio: HTMLAudioElement, seconds: number, rate: number) {
  audio.playbackRate = rate;
  audio.currentTime = seconds;
  void audio.play();
}

// Plays one line of a Kokoro recording (the voice of the daily stories), stopping exactly where it ends. Without a
// recording, or for a line it doesn't have, the browser reads the text. Render <audio {...audioProps} /> once.
// The element and the stop time are state, not refs, so play buttons built during render can use playLine.
export function useLinePlayer(narration: LineNarration | null) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [stopAt, setStopAt] = useState<number | null>(null);
  const [onEnd, setOnEnd] = useState<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audio || stopAt === null) return;
    const id = setInterval(() => {
      if (audio.currentTime < stopAt) return;
      audio.pause();
      setStopAt(null);
      onEnd?.();
      setOnEnd(null);
    }, 50);
    return () => clearInterval(id);
  }, [audio, stopAt, onEnd]);

  const stop = () => {
    audio?.pause();
    window.speechSynthesis?.cancel();
    setStopAt(null);
    setOnEnd(null);
    setIsPlaying(false);
  };

  // rate 1 is the recording's own speed; the browser's voice reads a little slower than its default.
  const playLine = (index: number, text: string, done?: () => void, rate = 1) => {
    const times = narration?.lineTimes[index];
    if (audio && times && narration?.texts[index] === text) {
      setOnEnd(() => done ?? null);
      setStopAt(times.end);
      playFrom(audio, times.start, rate);
      return;
    }
    setIsPlaying(true);
    speak(text, "us", FALLBACK_RATE * rate, () => {
      setIsPlaying(false);
      done?.();
    });
  };

  // The same, finding the line by its text.
  const playText = (text: string, done?: () => void, rate = 1) => playLine(narration?.texts.indexOf(text) ?? -1, text, done, rate);

  const audioProps = {
    ref: setAudio,
    src: narration?.url,
    preload: "metadata" as const,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
  };

  const voice: Voice = { say: playText, stop };

  return { playLine, playText, stop, voice, isPlaying, audioProps, hasRecording: narration !== null };
}

// What a component needs to read text out: the recording when there is one, else the browser's voice.
export interface Voice {
  say: (text: string, done?: () => void, rate?: number) => void;
  stop: () => void;
}

export const browserVoice: Voice = {
  say: (text, done, rate = 1) => speak(text, "us", FALLBACK_RATE * rate, done),
  stop: () => window.speechSynthesis?.cancel(),
};
