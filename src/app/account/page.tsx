import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { StreakBadge } from "@/components/StreakBadge";
import { StudySettings } from "@/components/StudySettings";
import { StudyStatsPanel } from "@/components/StudyStatsPanel";
import { getStreak, getStudyStats, getUserContext, getUserSettings } from "@/lib/user-data";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function AccountPage() {
  return (
    <AppShell active="/account">
      <main className="w-full max-w-3xl px-4 py-8 md:px-10">
        <Breadcrumbs items={[{ label: "Account" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">Account</h1>
        <Suspense fallback={<ListSkeleton rows={2} />}>
          <AccountDetails />
        </Suspense>
        <p className="mt-10 text-sm text-muted">
          <Link href="/privacy" className="font-semibold text-brand">
            Privacy Policy
          </Link>
        </p>
      </main>
    </AppShell>
  );
}

async function AccountDetails() {
  const ctx = await getUserContext();
  if (!ctx) return <SignInPrompt message="Sign in to see your account." />;
  const [streak, settings, stats] = await Promise.all([
    getStreak().catch(() => null),
    getUserSettings().catch(() => null),
    getStudyStats().catch(() => null),
  ]);
  const name = (ctx.user.user_metadata.full_name as string | undefined) ?? ctx.user.email;

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-line bg-surface p-5 shadow-[0_4px_0_0_var(--color-line)]">
        <p className="text-xl font-extrabold text-ink">{name}</p>
        <p className="text-sm text-muted">{ctx.user.email} · signed in with Google</p>
        {streak && (
          <div className="mt-3">
            <StreakBadge streak={streak} />
          </div>
        )}
      </section>

      {stats && <StudyStatsPanel stats={stats} goalMinutes={settings?.dailyGoalMinutes ?? 15} longestStreak={streak?.longest ?? 0} />}

      {settings && <StudySettings initial={settings} />}

      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold text-ink">Delete account</h2>
        <p className="mt-1 text-sm text-muted">
          Removes your account and everything stored with it. Your voice recordings are never uploaded, so there is nothing
          else to delete.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
