import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getOverview, requireAdmin } from "@/lib/admin";

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
  const stats = await getOverview(ctx);

  const tiles = [
    { label: "Users", value: stats.users },
    { label: "Active today", value: stats.activeToday },
    { label: "Stored lessons", value: stats.lessons },
    { label: "Lessons started", value: stats.progress },
    { label: "Saved words", value: stats.savedWords },
    { label: "Favorites", value: stats.favorites },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className="animate-fade-up rounded-3xl border border-line bg-white p-5 shadow-[0_4px_0_0_var(--color-line)]">
          <p className="text-sm font-semibold text-muted">{t.label}</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{t.value.toLocaleString("en-US")}</p>
        </div>
      ))}
    </div>
  );
}
