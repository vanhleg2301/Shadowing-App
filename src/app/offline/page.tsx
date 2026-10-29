import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { OfflineLessons } from "@/components/OfflineLessons";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = { title: "Offline lessons · Shadowing English" };

// Also the page the service worker shows when a page can't load without a network.
export default function OfflinePage() {
  return (
    <AppShell active="/offline">
      <main className="w-full max-w-3xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "Offline lessons" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">Offline lessons</h1>
        <p className="mt-2 text-muted">
          News stories you saved with &ldquo;Save for offline&rdquo; open and play here without internet. YouTube videos
          always need a connection.
        </p>
        <OfflineLessons />
      </main>
    </AppShell>
  );
}
