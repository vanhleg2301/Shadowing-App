"use client";

import { useState } from "react";
import { setSavedWord } from "@/app/actions";
import type { WordLookupState } from "@/components/WordLookupSheet";
import { useAuth } from "@/hooks/useAuth";
import { normalizeWord, type WordInfo } from "@/lib/dictionary";

const LOOKUP_TIMEOUT_MS = 20000;

// Tap a word to see its meaning and save it to My words; shared by the lesson player and the news reader.
export function useWordLookup(videoId: string, initialSavedWords: string[]) {
  const { isAvailable: isAuthAvailable, signInWithGoogle } = useAuth();
  const [savedWords, setSavedWords] = useState(() => new Set(initialSavedWords));
  const [lookup, setLookup] = useState<WordLookupState | null>(null);

  const fetchLookup = async (word: string, sentence: string) => {
    setLookup({ word, sentence, status: "loading", info: null });
    let info: WordInfo | null = null;
    let isRateLimited = false;
    try {
      const query = new URLSearchParams({ word, sentence });
      const res = await fetch(`/api/lookup?${query}`, {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      });
      if (res.ok) info = await res.json();
      isRateLimited = res.status === 429;
    } catch {
      // Network failure or timeout: fall through to the error state so the sheet never hangs on "loading".
    }
    setLookup((current) =>
      current?.word === word ? { word, sentence, status: info ? "found" : isRateLimited ? "rate-limited" : "error", info } : current,
    );
  };

  const toggleSave = async (current: WordLookupState) => {
    const isSaved = !savedWords.has(current.word);
    const update = (save: boolean) =>
      setSavedWords((prev) => {
        const next = new Set(prev);
        if (save) next.add(current.word);
        else next.delete(current.word);
        return next;
      });
    update(isSaved);
    const result = await setSavedWord({
      word: current.word,
      sentence: current.sentence,
      videoId,
      entry: current.info ? { ...current.info } : null,
      isSaved,
    });
    if (result.ok) return;
    update(!isSaved);
    if (result.error === "signed-out") await signInWithGoogle();
  };

  // Returns false for tokens that aren't words (numbers, punctuation).
  const openWord = (token: string, sentence: string): boolean => {
    const word = normalizeWord(token);
    if (!word) return false;
    fetchLookup(word, sentence);
    return true;
  };

  const sheetProps = lookup
    ? {
        lookup,
        onClose: () => setLookup(null),
        onRetry: () => fetchLookup(lookup.word, lookup.sentence),
        saved: isAuthAvailable ? { isSaved: savedWords.has(lookup.word), onToggle: () => toggleSave(lookup) } : undefined,
      }
    : null;

  return { lookup, openWord, sheetProps };
}
