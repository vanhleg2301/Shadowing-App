import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LevelCheck } from "@/components/course/LevelCheck";

export const metadata: Metadata = { title: "Level check · Shadowing English" };

export default function LevelCheckPage() {
  return (
    <AppShell active="/course">
      <main className="w-full max-w-xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-10">
        <Link href="/course" className="text-sm font-semibold text-brand">
          ← Course
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">2-minute level check</h1>
        <p className="mt-2 text-muted">Listen to 5 short sentences and answer a question about each. We&apos;ll suggest a plan and a video speed for you.</p>
        <div className="mt-6">
          <LevelCheck />
        </div>
      </main>
    </AppShell>
  );
}
