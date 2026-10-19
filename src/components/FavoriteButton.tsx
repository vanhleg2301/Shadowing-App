"use client";

import { useState, useTransition } from "react";
import { setFavorite } from "@/app/actions";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteButtonProps {
  videoId: string;
  title: string;
  initialIsFavorite: boolean;
  size?: "sm" | "md";
}

export function FavoriteButton({ videoId, title, initialIsFavorite, size = "md" }: FavoriteButtonProps) {
  const { isAvailable, signInWithGoogle } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  if (!isAvailable) return null;

  const handleClick = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      const result = await setFavorite({ videoId, title, isFavorite: next });
      if (result.ok) return;
      setIsFavorite(!next);
      if (result.error === "signed-out") await signInWithGoogle();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`btn-3d shrink-0 rounded-full ${size === "sm" ? "size-9" : "size-10"} ${
        isFavorite ? "border-rose-300 bg-rose-50 text-rose-500" : "text-muted"
      }`}
    >
      <svg key={String(isFavorite)} viewBox="0 0 24 24" className={`size-5 ${isFavorite ? "animate-pop" : ""}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinejoin="round" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
    </button>
  );
}
