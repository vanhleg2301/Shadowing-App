import { AppShell } from "@/components/AppShell";
import { PlacementTest } from "@/components/PlacementTest";

export const metadata = { title: "Find your level" };

export default function PlacementPage() {
  return (
    <AppShell active="/">
      <main className="w-full max-w-2xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Find your level</h1>
        <p className="mt-2 text-muted">12 quick questions, about 3 minutes. Turn your sound on for the listening ones.</p>
        <div className="mt-6">
          <PlacementTest />
        </div>
      </main>
    </AppShell>
  );
}
