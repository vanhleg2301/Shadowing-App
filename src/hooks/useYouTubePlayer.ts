"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STATE_PLAYING = 1;
const POLL_MS = 100;
// Segment ends are checked against the player directly, faster than the UI poll, so playback stops
// within a few hundredths of a second of the sentence end instead of spilling into the next one.
const SEGMENT_CHECK_MS = 25;
const SEGMENT_END_EARLY_S = 0.04;

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
// A null videoId mounts nothing (hosted-audio lessons use useAudioPlayer instead).
// The YouTube player (about 1 MB of scripts) only loads on the first play, seek or segment; until then
// the page shows the thumbnail. Calls made before it is ready run once it is.
export function useYouTubePlayer(videoId: string | null, startSeconds = 0) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const startRef = useRef(startSeconds);
  const rateRef = useRef(1);
  const pendingRef = useRef<((player: YT.Player) => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds);
  const segmentRef = useRef<{ end: number; timer: ReturnType<typeof setInterval>; resolve: () => void } | null>(null);
  // Read inside callbacks, which must not wait for a re-render to know the player is ready.
  const isPlayerReadyRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !videoId || !isActivated) return;
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
        playerVars: { playsinline: 1, rel: 0, cc_load_policy: 0, iv_load_policy: 3, start: Math.floor(startRef.current) },
        events: {
          onReady: (event) => {
            isPlayerReadyRef.current = true;
            setIsPlayerReady(true);
            if (rateRef.current !== 1) event.target.setPlaybackRate(rateRef.current);
            const pending = pendingRef.current;
            pendingRef.current = null;
            pending?.(event.target);
          },
          onStateChange: (event) => setIsPlaying(event.data === STATE_PLAYING),
        },
      });
    };
    mount();

    return () => {
      isCancelled = true;
      if (segmentRef.current) clearInterval(segmentRef.current.timer);
      playerRef.current?.destroy();
      playerRef.current = null;
      isPlayerReadyRef.current = false;
      container.innerHTML = "";
    };
  }, [videoId, isActivated]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setCurrentTime(playerRef.current?.getCurrentTime() ?? 0), POLL_MS);
    return () => clearInterval(id);
  }, [isPlaying]);

  const endSegment = useCallback(() => {
    const segment = segmentRef.current;
    if (!segment) return;
    clearInterval(segment.timer);
    segmentRef.current = null;
    segment.resolve();
  }, []);

  // Runs now if the player is ready, otherwise loads it and runs once it is.
  const withPlayer = useCallback((run: (player: YT.Player) => void) => {
    const player = playerRef.current;
    if (player && isPlayerReadyRef.current) {
      run(player);
      return;
    }
    pendingRef.current = run;
    setIsActivated(true);
  }, []);

  const play = useCallback(() => withPlayer((player) => player.playVideo()), [withPlayer]);
  const pause = useCallback(() => {
    endSegment();
    playerRef.current?.pauseVideo();
  }, [endSegment]);
  const seekTo = useCallback(
    (seconds: number) => {
      endSegment();
      setCurrentTime(seconds);
      if (playerRef.current && isPlayerReadyRef.current) playerRef.current.seekTo(seconds, true);
      // Before the player exists, just remember where to start; seeking alone doesn't load it.
      else startRef.current = seconds;
    },
    [endSegment],
  );

  // Plays start..end once and resolves when it stops (at the end, or when something else takes over).
  const runSegment = useCallback(
    (player: YT.Player, start: number, end: number): Promise<void> => {
      endSegment();
      player.seekTo(start, true);
      setCurrentTime(start);
      player.playVideo();
      return new Promise((resolve) => {
        // Right after seekTo the player can still report the old position, so only watch for the end
        // once it has reported a time inside the segment.
        let isArmed = false;
        const timer = setInterval(() => {
          const time = playerRef.current?.getCurrentTime() ?? 0;
          if (!isArmed) {
            isArmed = time >= start - 0.3 && time < end;
            return;
          }
          if (time < end - SEGMENT_END_EARLY_S) return;
          playerRef.current?.pauseVideo();
          endSegment();
        }, SEGMENT_CHECK_MS);
        segmentRef.current = { end, timer, resolve };
      });
    },
    [endSegment],
  );

  const playSegment = useCallback(
    (start: number, end: number): Promise<void> =>
      new Promise((resolve) => {
        withPlayer((player) => {
          runSegment(player, start, end).then(resolve);
        });
      }),
    [withPlayer, runSegment],
  );

  const setRate = useCallback((rate: number) => {
    rateRef.current = rate;
    if (isPlayerReadyRef.current) playerRef.current?.setPlaybackRate(rate);
  }, []);

  // Controls work before the player loads (their call loads it), so the lesson counts as ready until a
  // load has started; then it waits for the player.
  const isReady = !isActivated || isPlayerReady;

  return { containerRef, isActivated, isReady, isPlaying, currentTime, play, pause, seekTo, playSegment, setRate };
}
