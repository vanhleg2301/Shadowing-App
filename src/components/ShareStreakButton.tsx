"use client";

import { useState } from "react";

interface ShareStreakButtonProps {
  days: number;
}

// Shares the streak image where the Web Share API supports files (most phones), else the link.
export function ShareStreakButton({ days }: ShareStreakButtonProps) {
  const [message, setMessage] = useState<string | null>(null);

  const handleShare = async () => {
    const text = `I've practised English ${days} day${days === 1 ? "" : "s"} in a row!`;
    const url = window.location.origin;
    try {
      const response = await fetch(`/share-card/${days}`);
      const file = new File([await response.blob()], `streak-${days}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, url });
      } else if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setMessage("Copied");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessage("Couldn't share");
    }
  };

  return (
    <button type="button" onClick={handleShare} className="shrink-0 text-xs font-semibold text-brand">
      {message ?? "Share"}
    </button>
  );
}
