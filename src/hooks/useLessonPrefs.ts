"use client";

import { useEffect, useState } from "react";

export type TextSize = "sm" | "md" | "lg";

export interface LessonPrefs {
  textSize: TextSize;
  // Listen first: transcript lines stay blurred until tapped (comprehensible-input style).
  hideText: boolean;
  autoScroll: boolean;
  showTranslation: boolean;
}

const STORAGE_KEY = "lesson-prefs";
const DEFAULTS: LessonPrefs = { textSize: "md", hideText: false, autoScroll: true, showTranslation: true };

// Per-device reading preferences; a convenience only, so storage failures fall back to defaults.
export function useLessonPrefs() {
  const [prefs, setPrefs] = useState<LessonPrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<LessonPrefs>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      setPrefs({ ...DEFAULTS, ...stored });
    } catch {
      // Keep defaults.
    }
  }, []);

  const updatePrefs = (patch: Partial<LessonPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode: the change still applies for this visit.
      }
      return next;
    });
  };

  return { prefs, updatePrefs };
}
