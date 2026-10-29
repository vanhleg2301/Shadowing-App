"use client";

import { useEffect, useState } from "react";

export const READER_SIZES = [16, 18, 20, 23, 26] as const;
export const READER_SPACINGS = { compact: 1.5, normal: 1.75, loose: 2.1 } as const;
export type ReaderSpacing = keyof typeof READER_SPACINGS;

export interface ReaderPrefs {
  sizeIndex: number;
  spacing: ReaderSpacing;
}

const STORAGE_KEY = "reader-prefs";
const DEFAULTS: ReaderPrefs = { sizeIndex: 2, spacing: "normal" };

// Text size and line spacing for the news reader, remembered on this device.
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<ReaderPrefs>;
      const sizeIndex = Math.min(Math.max(Number(stored.sizeIndex ?? DEFAULTS.sizeIndex), 0), READER_SIZES.length - 1);
      const spacing = stored.spacing && stored.spacing in READER_SPACINGS ? stored.spacing : DEFAULTS.spacing;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      setPrefs({ sizeIndex, spacing });
    } catch {
      // Keep defaults.
    }
  }, []);

  const updatePrefs = (patch: Partial<ReaderPrefs>) => {
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
