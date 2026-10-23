"use client";

import { useEffect, useRef } from "react";
import { addStudyTime } from "@/app/actions";

interface StudyTimerProps {
  // True while media is playing, so passive listening counts without touching the screen.
  isBusy?: boolean;
}

const IDLE_AFTER_MS = 60_000;
const FLUSH_EVERY_S = 60;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

// Counts active study seconds on this page and reports them towards the daily goal.
export function StudyTimer({ isBusy = false }: StudyTimerProps) {
  const isBusyRef = useRef(isBusy);
  const lastActivity = useRef(0);
  const pending = useRef(0);
  const isStopped = useRef(false);

  useEffect(() => {
    isBusyRef.current = isBusy;
  }, [isBusy]);

  useEffect(() => {
    lastActivity.current = Date.now();
    const markActive = () => {
      lastActivity.current = Date.now();
    };

    const flush = () => {
      const seconds = Math.min(pending.current, 300);
      if (seconds < 1 || isStopped.current) return;
      pending.current -= seconds;
      void addStudyTime({ seconds }).then((result) => {
        if (!result.ok && result.error === "signed-out") isStopped.current = true;
      });
    };

    const tick = setInterval(() => {
      const isVisible = document.visibilityState === "visible";
      const isActive = isBusyRef.current || Date.now() - lastActivity.current < IDLE_AFTER_MS;
      if (!isVisible || !isActive) return;
      pending.current++;
      if (pending.current >= FLUSH_EVERY_S) flush();
    }, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else markActive();
    };

    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, markActive, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(tick);
      flush();
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, markActive);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
