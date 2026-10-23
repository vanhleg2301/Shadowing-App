import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { WordListView } from "@/components/WordListView";
import { getSavedWords, MASTERED_INTERVAL_DAYS, type SavedWord } from "@/lib/user-data";

export default function VocabularyPage() {
  return (
    <AppShell active="/vocabulary">
      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">My words</h1>
        <p className="mt-2 text-muted">Words you saved while watching, with the sentence you met them in.</p>
        <Suspense fallback={<ListSkeleton />}>
          <WordList />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function WordList() {
  let words: SavedWord[] | null;
  try {
    words = await getSavedWords();
  } catch {
    return <p className="mt-8 text-red-600">Couldn&apos;t load your words. Please try again later.</p>;
  }

  if (!words) return <SignInPrompt message="Sign in to build your own word list as you watch." />;
  if (words.length === 0) {
    return <p className="mt-8 text-muted">No saved words yet. Tap a word in any transcript, then press “Save word”.</p>;
  }

  return <WordListView words={words} masteredInterval={MASTERED_INTERVAL_DAYS} />;
}
