"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Icon } from "@/components/Icon";

interface RecordingPlayerProps {
  blob: Blob;
  label: string;
}

function readColor(variable: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}

// Waveform player for the learner's own recording (wavesurfer.js, BSD-3). Canvas can't use CSS
// variables, so the theme colours are read once when the waveform is created.
export function RecordingPlayer({ blob, label }: RecordingPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const wave = WaveSurfer.create({
      container: containerRef.current,
      height: 44,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      cursorWidth: 0,
      waveColor: readColor("--muted", "#9ba1c2"),
      progressColor: readColor("--brand", "#4f46e5"),
      normalize: true,
    });
    wave.on("ready", (d) => setDuration(d));
    wave.on("play", () => setIsPlaying(true));
    wave.on("pause", () => setIsPlaying(false));
    wave.on("finish", () => setIsPlaying(false));
    wave.loadBlob(blob);
    waveRef.current = wave;
    return () => {
      wave.destroy();
      waveRef.current = null;
    };
  }, [blob]);

  return (
    <div className="flex animate-fade-in items-center gap-3 rounded-2xl border border-line bg-cream p-2 pr-3">
      <button
        type="button"
        onClick={() => waveRef.current?.playPause()}
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand"
      >
        <Icon name={isPlaying ? "pause" : "play"} className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <div ref={containerRef} className="w-full" />
      </div>
      <span className="shrink-0 font-mono text-xs text-muted">{duration ? `${duration.toFixed(1)}s` : ""}</span>
    </div>
  );
}

export function playBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  return audio.play();
}
