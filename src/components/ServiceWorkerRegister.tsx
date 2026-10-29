"use client";

import { useEffect } from "react";

// Registers public/sw.js on every visit (not only when reminders are on), so saved lessons and the
// offline page work. Skipped in development, where cached build files would get in the way.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
