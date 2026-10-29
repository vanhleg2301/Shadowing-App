"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 100;
const SEGMENT_CHECK_MS = 25;
const SEGMENT_END_EARLY_S = 0.04;

// Same controls as useYouTubePlayer, backed by an <audio> element, for lessons with hosted audio.
// A null src does nothing.
export function useAudioPlayer(src: string | null, startSeconds = 0) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds);
  const segmentRef = useRef<{ timer: ReturnType<typeof setInterval>; resolve: () => void } | null>(null);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = src;
    audioRef.current = audio;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    // Keeps the position current while the page is in the background, where the poll below is throttled.
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleMetadata = () => {
      if (startSeconds > 0) audio.currentTime = startSeconds;
    };
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handlePause);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      if (segmentRef.current) clearInterval(segmentRef.current.timer);
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handlePause);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
    // Only the initial position matters; changing it later must not reload the audio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setCurrentTime(audioRef.current?.currentTime ?? 0), POLL_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  const endSegment = useCallback(() => {
    const segment = segmentRef.current;
    if (!segment) return;
    clearInterval(segment.timer);
    segmentRef.current = null;
    segment.resolve();
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => setIsPlaying(false));
  }, []);
  const pause = useCallback(() => {
    endSegment();
    audioRef.current?.pause();
  }, [endSegment]);
  const seekTo = useCallback(
    (seconds: number) => {
      endSegment();
      if (audioRef.current) audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    },
    [endSegment],
  );

  const playSegment = useCallback(
    (start: number, end: number): Promise<void> => {
      const audio = audioRef.current;
      if (!audio) return Promise.resolve();
      endSegment();
      audio.currentTime = start;
      setCurrentTime(start);
      audio.play().catch(() => setIsPlaying(false));
      return new Promise((resolve) => {
        const timer = setInterval(() => {
          const current = audioRef.current;
          if (!current || current.currentTime < end - SEGMENT_END_EARLY_S) return;
          current.pause();
          endSegment();
        }, SEGMENT_CHECK_MS);
        segmentRef.current = { timer, resolve };
      });
    },
    [endSegment],
  );
  const setRate = useCallback((rate: number) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  // iOS doesn't load metadata until the first tap, so the controls are usable straight away.
  const isReady = src !== null;

  return { isReady, isPlaying, currentTime, play, pause, seekTo, playSegment, setRate };
}
