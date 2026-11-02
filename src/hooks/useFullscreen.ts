"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

// iPhones have no Fullscreen API for page elements, so isSupported is false there.
export function useFullscreen<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSupported = useSyncExternalStore(subscribeToNothing, () => document.fullscreenEnabled, () => false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current && containerRef.current !== null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current?.requestFullscreen();
  }, []);

  return { containerRef, isSupported, isFullscreen, toggle };
}
