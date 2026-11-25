"use client";

import Link from "next/link";
import type { MissedResult } from "@/hooks/useMissedToReview";

interface MissedToReviewNoteProps {
  missed: MissedResult | null;
  isSignedIn: boolean;
}

// Under a checked dictation: which missed phrases went to Review.
export function MissedToReviewNote({ missed, isSignedIn }: MissedToReviewNoteProps) {
  if (!missed || missed.phrases.length === 0) return null;
  const list = missed.phrases.map((p) => `“${p}”`).join(", ");
  return (
    <p className="mt-2 text-sm text-muted">
      {missed.isSaved ? (
        <>
          Added to{" "}
          <Link href="/review" className="font-semibold text-brand">
            Review
          </Link>{" "}
          to practise: {list}
        </>
      ) : isSignedIn ? (
        <>Couldn&apos;t add {list} to Review.</>
      ) : (
        <>Sign in to practise {list} again in Review.</>
      )}
    </p>
  );
}
