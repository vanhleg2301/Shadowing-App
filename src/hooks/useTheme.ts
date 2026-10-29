"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function applyTheme(preference: ThemePreference) {
  const isDark = preference === "dark" || (preference === "system" && window.matchMedia(DARK_QUERY).matches);
  const theme = isDark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  // The background comes from the palette chosen in Admin -> Theme.
  const background = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  if (background) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", background);
}

export function useTheme() {
  // Starts as "system" on the server and first render; the real value is read after mount.
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    setPreference(readPreference());
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    // Follow the OS while on "system", e.g. when iOS switches to dark mode at sunset.
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const changePreference = (next: ThemePreference) => {
    setPreference(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode: the choice just won't persist.
    }
    applyTheme(next);
  };

  return { preference, changePreference };
}
