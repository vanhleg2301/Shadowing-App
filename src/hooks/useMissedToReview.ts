"use client";

import { savePhrasesToReview } from "@/app/actions";
import { useAuth } from "@/hooks/useAuth";
import { getMissedChunks, type WordResult } from "@/lib/practice";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export interface MissedResult {
  // What was missed, as it is written in the sentence.
  phrases: string[];
  isSaved: boolean;
}

// After a dictation is checked: the phrases the learner missed go to Review as cards that blank them out of the
// sentence, with a link back to where it is said. Signed out, they are only shown.
export function useMissedToReview(videoId: string) {
  const { user } = useAuth();

  const saveMissed = async (sentence: { text: string; translation?: string; index: number }, words: WordResult[]): Promise<MissedResult> => {
    const phrases = getMissedChunks(words);
    if (!user || phrases.length === 0) return { phrases, isSaved: false };
    const result = await savePhrasesToReview({
      phrases: phrases.map((text) => ({
        text,
        meaning: sentence.translation?.slice(0, 200) ?? "You missed this when you heard it in the video.",
        example: sentence.text.slice(0, 300),
        ...(YOUTUBE_ID.test(videoId) ? { videoId, sentenceIndex: sentence.index } : {}),
      })),
    }).catch(() => null);
    return { phrases, isSaved: result?.ok ?? false };
  };

  return { saveMissed, isSignedIn: user !== null };
}
