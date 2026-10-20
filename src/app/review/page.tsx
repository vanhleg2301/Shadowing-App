import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ReviewSession } from "@/components/ReviewSession";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { StreakBadge } from "@/components/StreakBadge";
import { getDueWords, getStreak } from "@/lib/user-data";

const SESSION_SIZE = 20;

export default function ReviewPage() {
  return (
    <AppShell active="/review">
      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Review</h1>
        <p className="mt-2 text-muted">Flashcards for your saved words, shown again right before you would forget them.</p>
        <Suspense fallback={<ListSkeleton rows={2} />}>
          <ReviewContent />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function ReviewContent() {
  let due: Awaited<ReturnType<typeof getDueWords>>;
  try {
    due = await getDueWords(SESSION_SIZE);
  } catch {
    return <p className="mt-8 text-red-600">Couldn&apos;t load your review cards. Please try again later.</p>;
  }
  if (!due) return <SignInPrompt message="Sign in to review the words you save while watching." />;

  const streak = await getStreak().catch(() => null);
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {streak && <StreakBadge streak={streak} />}
        <span className="text-sm font-semibold text-muted">{due.dueCount} due</span>
      </div>
      <ReviewSession cards={due.cards} />
    </>
  );
}
