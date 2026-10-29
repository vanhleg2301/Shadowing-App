"use client";

import { useEffect, useState } from "react";
import { isOfflineSupported, listOfflineLessons, removeLessonOffline, saveLessonOffline } from "@/lib/offline";

interface OfflineButtonProps {
  path: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  className?: string;
}

type Status = "idle" | "saving" | "saved" | "error";

// Saves a hosted-audio lesson (page, audio, cover) so it opens and plays without a network.
export function OfflineButton({ path, title, audioUrl, imageUrl, className = "" }: OfflineButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    // Browser storage is only readable after hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsSupported(isOfflineSupported());
    if (listOfflineLessons().some((l) => l.path === path)) setStatus("saved");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [path]);

  if (!isSupported) return null;

  const handleClick = async () => {
    if (status === "saving") return;
    if (status === "saved") {
      await removeLessonOffline({ path, audioUrl, imageUrl });
      setStatus("idle");
      return;
    }
    setStatus("saving");
    try {
      await saveLessonOffline({ path, title, audioUrl, imageUrl });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  const label = { idle: "Save for offline", saving: "Saving...", saved: "Saved offline ✓", error: "Couldn't save · retry" }[status];
  return (
    <button
      type="button"
      onClick={handleClick}
      title={status === "saved" ? "Tap to remove the offline copy" : "Keep this lesson to study without internet"}
      className={`btn-3d px-3 py-2 text-xs font-bold ${status === "saved" ? "btn-soft" : ""} ${className}`}
    >
      {label}
    </button>
  );
}
