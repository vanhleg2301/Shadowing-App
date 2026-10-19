import { notFound } from "next/navigation";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminListControls";
import { ADMIN_PAGE_SIZE, parsePage, requireAdmin } from "@/lib/admin";

export default function AdminAuditPage({ searchParams }: PageProps<"/admin/audit">) {
  return (
    <AdminLayout active="/admin/audit" title="Activity log">
      {searchParams.then((sp) => (
        <AuditLog page={parsePage(sp.page)} />
      ))}
    </AdminLayout>
  );
}

interface AuditRow {
  id: number;
  admin_email: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

async function AuditLog({ page }: { page: number }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { data, count, error } = await ctx.admin
    .from("admin_audit")
    .select("id, admin_email, action, target, details, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (error) return <p className="mt-8 text-red-600">Couldn&apos;t load the log: {error.message}</p>;

  const rows = (data ?? []) as AuditRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-muted">Every change made in the admin panel, newest first.</p>
      <AdminPagination basePath="/admin/audit" page={page} totalPages={totalPages} total={total} query="" />
      <ul className="divide-y divide-line rounded-3xl border border-line bg-white">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-1 px-4 py-3 text-sm md:flex-row md:items-center md:gap-4">
            <span className="shrink-0 text-muted md:w-44">{formatDate(r.created_at)}</span>
            <span className="shrink-0 rounded-md bg-cream px-2 py-0.5 font-mono text-xs font-semibold text-ink">{r.action}</span>
            <span className="min-w-0 flex-1 truncate text-ink" title={JSON.stringify(r.details)}>
              {r.target ?? "—"}
            </span>
            <span className="shrink-0 text-xs text-muted">{r.admin_email}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-6 text-muted">Nothing logged yet.</li>}
      </ul>
    </div>
  );
}
