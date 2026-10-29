import { notFound } from "next/navigation";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { AdminKeysetNav } from "@/components/admin/AdminListControls";
import { ADMIN_PAGE_SIZE, requireAdmin, type AdminContext } from "@/lib/admin";
import { parseKeysetCursor, toKeysetPage, type KeysetCursor } from "@/lib/keyset";

export default function AdminErrorsPage({ searchParams }: PageProps<"/admin/errors">) {
  return (
    <AdminLayout active="/admin/errors" title="Errors">
      {searchParams.then((sp) => (
        <ErrorLog cursor={parseKeysetCursor(sp)} />
      ))}
    </AdminLayout>
  );
}

interface ErrorRow {
  id: number;
  route_type: string;
  route_path: string;
  path: string;
  method: string;
  message: string;
  digest: string | null;
  stack: string | null;
  created_at: string;
}

async function countRecentErrors(ctx: AdminContext) {
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  return ctx.admin.from("error_events").select("id", { count: "exact", head: true }).gte("created_at", dayAgo);
}

async function ErrorLog({ cursor }: { cursor: KeysetCursor }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  let request = ctx.admin.from("error_events").select("id, route_type, route_path, path, method, message, digest, stack, created_at");
  if (cursor.after !== null) request = request.gt("id", cursor.after);
  else if (cursor.before !== null) request = request.lt("id", cursor.before);
  const [{ data, error }, recent] = await Promise.all([
    request.order("id", { ascending: cursor.after !== null }).limit(ADMIN_PAGE_SIZE + 1),
    countRecentErrors(ctx),
  ]);
  if (error) return <p className="mt-8 text-red-600">Couldn&apos;t load errors: {error.message}</p>;

  const { rows, olderThan, newerThan } = toKeysetPage((data ?? []) as ErrorRow[], cursor, ADMIN_PAGE_SIZE);

  return (
    <div className="mt-8 space-y-4">
      <div className="w-fit rounded-3xl border border-line bg-surface p-5 shadow-[0_4px_0_0_var(--color-line)]">
        <p className="text-sm font-semibold text-muted">Errors, last 24 h</p>
        <p className="mt-1 text-3xl font-extrabold text-ink">{(recent.count ?? 0).toLocaleString("en-US")}</p>
      </div>
      <p className="text-sm text-muted">
        Server errors from pages, API routes and server actions, newest first. Open one to see where it happened.
      </p>
      <AdminKeysetNav basePath="/admin/errors" olderThan={olderThan} newerThan={newerThan} />
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id}>
            <details className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
              <summary className="cursor-pointer list-none">
                <span className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                  <span className="shrink-0 text-muted md:w-44">{formatDate(r.created_at)}</span>
                  <span className="shrink-0 rounded-md bg-cream px-2 py-0.5 font-mono text-xs font-semibold text-ink">{r.route_type}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">{r.message}</span>
                </span>
              </summary>
              <dl className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-[8rem_1fr]">
                <dt>Request</dt>
                <dd className="font-mono text-ink">
                  {r.method} {r.path}
                </dd>
                <dt>Route</dt>
                <dd className="font-mono text-ink">{r.route_path}</dd>
                {r.digest && (
                  <>
                    <dt>Digest</dt>
                    <dd className="font-mono text-ink">{r.digest}</dd>
                  </>
                )}
              </dl>
              {r.stack && <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-cream p-3 text-xs text-ink">{r.stack}</pre>}
            </details>
          </li>
        ))}
        {rows.length === 0 && <li className="rounded-2xl border border-line bg-surface px-4 py-6 text-muted">No errors logged. Nice.</li>}
      </ul>
    </div>
  );
}
