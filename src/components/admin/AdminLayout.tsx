import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/lessons", label: "Lessons" },
];

interface AdminLayoutProps {
  active: string;
  title: string;
  children: ReactNode;
}

export function AdminLayout({ active, title, children }: AdminLayoutProps) {
  return (
    <AppShell active="/admin">
      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Admin</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        <nav className="mt-4 flex gap-1 rounded-2xl border border-line bg-white p-1 sm:w-fit">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold transition-colors ${
                tab.href === active ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<p className="mt-8 text-muted">Loading...</p>}>{children}</Suspense>
      </main>
    </AppShell>
  );
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
}
