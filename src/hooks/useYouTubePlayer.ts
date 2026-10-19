"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STATE_PLAYING = 1;
const POLL_MS = 100;

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

// startSeconds cues the video at that point without autoplaying (used to resume a lesson).
export function useYouTubePlayer(videoId: string, startSeconds = 0) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isCancelled = false;

    const mount = async () => {
      await loadYouTubeApi();
      if (isCancelled || !window.YT) return;
      // YT replaces its target element with an iframe, so give it a node React doesn't own.
      const target = document.createElement("div");
      container.appendChild(target);
      playerRef.current = new window.YT.Player(target, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1, rel: 0, cc_load_policy: 0, iv_load_policy: 3, start: Math.floor(startSeconds) },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event) => setIsPlaying(event.data === STATE_PLAYING),
        },
      });
    };
    mount();

    return () => {
      isCancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      container.innerHTML = "";
    };
    // Only the initial position matters; changing it later must not rebuild the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setCurrentTime(playerRef.current?.getCurrentTime() ?? 0), POLL_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
    setCurrentTime(seconds);
  }, []);
  const setRate = useCallback((rate: number) => playerRef.current?.setPlaybackRate(rate), []);

  return { containerRef, isReady, isPlaying, currentTime, play, pause, seekTo, setRate };
}
