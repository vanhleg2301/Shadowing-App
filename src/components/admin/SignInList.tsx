import Link from "next/link";
import { formatDate } from "@/components/admin/AdminLayout";

export interface SignInEventRow {
  id: number;
  user_id: string | null;
  email: string | null;
  event: string;
  device: string | null;
  country: string | null;
  detail: string | null;
  created_at: string;
}

const EVENT_STYLE: Record<string, { label: string; className: string }> = {
  sign_in: { label: "Signed in", className: "bg-brand-soft text-brand" },
  sign_in_failed: { label: "Failed", className: "bg-red-500/15 text-red-600" },
  sign_out: { label: "Signed out", className: "bg-cream text-muted" },
};

export function SignInList({ rows, showEmail = true }: { rows: SignInEventRow[]; showEmail?: boolean }) {
  return (
    <ul className="divide-y divide-line rounded-3xl border border-line bg-surface">
      {rows.map((r) => {
        const style = EVENT_STYLE[r.event] ?? { label: r.event, className: "bg-cream text-muted" };
        return (
          <li key={r.id} className="flex flex-col gap-1 px-4 py-3 text-sm md:flex-row md:items-center md:gap-4">
            <span className="shrink-0 text-muted md:w-44">{formatDate(r.created_at)}</span>
            <span className={`w-fit shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${style.className}`}>{style.label}</span>
            {showEmail && (
              <span className="min-w-0 flex-1 truncate text-ink">
                {r.user_id ? (
                  <Link href={`/admin/users/${r.user_id}`} className="font-semibold hover:text-brand">
                    {r.email ?? r.user_id}
                  </Link>
                ) : (
                  (r.email ?? "Unknown")
                )}
                {r.detail && <span className="ml-2 text-xs text-muted">{r.detail}</span>}
              </span>
            )}
            <span className="shrink-0 text-xs text-muted">
              {r.device ?? "Unknown device"}
              {r.country ? ` · ${r.country}` : ""}
            </span>
          </li>
        );
      })}
      {rows.length === 0 && <li className="px-4 py-6 text-muted">Nothing recorded yet.</li>}
    </ul>
  );
}
