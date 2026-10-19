"use client";

import { useEffect } from "react";

const COOKIE = "tz";

// Lets the server work out the learner's local "today" for streaks.
export function TimeZoneSync() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone || document.cookie.includes(`${COOKIE}=${encodeURIComponent(timeZone)}`)) return;
    document.cookie = `${COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return null;
}
