import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ColumnChart } from "@/components/admin/ColumnChart";
import { RankedBars } from "@/components/admin/RankedBars";
import { getAnalytics, getOverview, requireAdmin } from "@/lib/admin";

export default function AdminOverviewPage() {
  return (
    <AdminLayout active="/admin" title="Overview">
      <Overview />
    </AdminLayout>
  );
}

async function Overview() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const [stats, analytics] = await Promise.all([getOverview(ctx), getAnalytics(ctx)]);

  const tiles = [
    { label: "Users", value: stats.users },
    { label: "Active today", value: stats.activeToday },
    { label: "Published videos", value: stats.publishedVideos },
    { label: "Stored transcripts", value: stats.lessons },
    { label: "Lessons started", value: stats.progress },
    { label: "Saved words", value: stats.savedWords },
    { label: "Favorites", value: stats.favorites },
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="animate-fade-up rounded-3xl border border-line bg-surface p-5 shadow-[0_4px_0_0_var(--color-line)]">
            <p className="text-sm font-semibold text-muted">{t.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">{t.value.toLocaleString("en-US")}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ColumnChart title="New sign-ups" subtitle="Per day, last 30 days" unit="sign-ups" data={analytics.signups} />
        <ColumnChart title="Active learners" subtitle="Learners who studied each day, last 30 days" unit="learners" data={analytics.activeLearners} />
        <RankedBars title="Most-started videos" subtitle="Learners who opened each lesson" emptyText="No lessons started yet." items={analytics.topVideos} />
        <RankedBars title="Most-saved words" subtitle="Learners who saved each word" emptyText="No saved words yet." items={analytics.topWords} />
      </div>
    </div>
  );
}
