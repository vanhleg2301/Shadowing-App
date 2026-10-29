"use client";

import { useEffect, useRef } from "react";

interface MediaSessionOptions {
  // null turns it off (YouTube lessons: the browser stops the embedded video in the background anyway).
  title: string | null;
  artist: string;
  artworkUrl?: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeekBackward: () => void;
}

// Lock-screen and notification controls for hosted audio. The title is the sentence being read, so the
// lock screen works as a one-line subtitle; previous/next move by sentence.
export function useMediaSession({ title, artist, artworkUrl, isPlaying, ...actions }: MediaSessionOptions) {
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });

  const isEnabled = title !== null;

  useEffect(() => {
    if (!isEnabled || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, () => void][] = [
      ["play", () => actionsRef.current.onPlay()],
      ["pause", () => actionsRef.current.onPause()],
      ["previoustrack", () => actionsRef.current.onPrevious()],
      ["nexttrack", () => actionsRef.current.onNext()],
      ["seekbackward", () => actionsRef.current.onSeekBackward()],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Not every browser supports every action.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Same as above.
        }
      }
      session.metadata = null;
    };
  }, [isEnabled]);

  useEffect(() => {
    if (title === null || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: artworkUrl ? [{ src: artworkUrl, sizes: "640x360", type: "image/jpeg" }] : [],
    });
  }, [title, artist, artworkUrl]);

  useEffect(() => {
    if (!isEnabled || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isEnabled, isPlaying]);
}
