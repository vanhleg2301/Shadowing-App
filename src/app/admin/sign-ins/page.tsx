import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination, AdminSearchBox } from "@/components/admin/AdminListControls";
import { SignInList, type SignInEventRow } from "@/components/admin/SignInList";
import { ADMIN_PAGE_SIZE, parsePage, parseQuery, requireAdmin, type AdminContext } from "@/lib/admin";

const EVENTS = [
  { value: "", label: "All" },
  { value: "sign_in", label: "Signed in" },
  { value: "sign_in_failed", label: "Failed" },
  { value: "sign_out", label: "Signed out" },
] as const;

export default function AdminSignInsPage({ searchParams }: PageProps<"/admin/sign-ins">) {
  return (
    <AdminLayout active="/admin/sign-ins" title="Sign-ins">
      {searchParams.then((sp) => {
        const event = typeof sp.event === "string" && EVENTS.some((e) => e.value === sp.event) ? sp.event : "";
        return <SignInLog page={parsePage(sp.page)} query={parseQuery(sp.q)} event={event} />;
      })}
    </AdminLayout>
  );
}

async function getStats(ctx: AdminContext) {
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const [today, failed, week] = await Promise.all([
    ctx.admin.from("sign_in_events").select("id", { count: "exact", head: true }).eq("event", "sign_in").gte("created_at", dayAgo),
    ctx.admin.from("sign_in_events").select("id", { count: "exact", head: true }).eq("event", "sign_in_failed").gte("created_at", weekAgo),
    ctx.admin.from("sign_in_events").select("user_id").eq("event", "sign_in").gte("created_at", weekAgo).limit(5000),
  ]);
  const learners = new Set(((week.data ?? []) as { user_id: string | null }[]).map((r) => r.user_id).filter(Boolean));
  return [
    { label: "Sign-ins, last 24 h", value: today.count ?? 0 },
    { label: "Learners signed in, 7 days", value: learners.size },
    { label: "Failed sign-ins, 7 days", value: failed.count ?? 0 },
  ];
}

async function SignInLog({ page, query, event }: { page: number; query: string; event: string }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  let request = ctx.admin
    .from("sign_in_events")
    .select("id, user_id, email, event, device, country, detail, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (event) request = request.eq("event", event);
  if (query) request = request.ilike("email", `%${query.replace(/[%_]/g, "")}%`);
  const [{ data, count, error }, stats] = await Promise.all([request, getStats(ctx)]);
  if (error) return <p className="mt-8 text-red-600">Couldn&apos;t load sign-ins: {error.message}</p>;

  const rows = (data ?? []) as SignInEventRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const filterHref = (value: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (value) params.set("event", value);
    const search = params.toString();
    return search ? `/admin/sign-ins?${search}` : "/admin/sign-ins";
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-line bg-surface p-5 shadow-[0_4px_0_0_var(--color-line)]">
            <p className="text-sm font-semibold text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">{s.value.toLocaleString("en-US")}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">
        Sign-ins, failed attempts and sign-outs, newest first. Recorded since this page was added; device and country only, no
        IP addresses.
      </p>
      <AdminSearchBox action="/admin/sign-ins" query={query} placeholder="Search by email" />
      <div className="flex flex-wrap gap-2">
        {EVENTS.map((e) => (
          <Link
            key={e.value}
            href={filterHref(e.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              event === e.value ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-ink"
            }`}
          >
            {e.label}
          </Link>
        ))}
      </div>
      <AdminPagination basePath="/admin/sign-ins" page={page} totalPages={totalPages} total={total} query={query} filters={event ? { event } : {}} />
      <SignInList rows={rows} />
    </div>
  );
}
