import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ListSkeleton } from "@/components/Skeleton";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/lessons", label: "Transcripts" },
  { href: "/admin/audit", label: "Activity" },
  { href: "/admin/sign-ins", label: "Sign-ins" },
  { href: "/admin/theme", label: "Theme" },
];

// Home › Admin › section › page, skipping steps that would repeat the title.
function getAdminTrail(active: string, title: string): Crumb[] {
  const tab = TABS.find((t) => t.href === active);
  if (active === "/admin") return [{ label: "Admin" }];
  const trail: Crumb[] = [{ label: "Admin", href: "/admin" }];
  if (tab && tab.label !== title) trail.push({ label: tab.label, href: tab.href });
  trail.push({ label: title });
  return trail;
}

interface AdminLayoutProps {
  active: string;
  title: string;
  children: ReactNode;
}

export function AdminLayout({ active, title, children }: AdminLayoutProps) {
  return (
    <AppShell active="/admin">
      <main className="w-full max-w-6xl px-4 py-8 md:px-10">
        <Breadcrumbs items={getAdminTrail(active, title)} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1 sm:w-fit">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-center text-sm font-semibold transition-colors ${
                tab.href === active ? "bg-ink text-cream" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<ListSkeleton />}>{children}</Suspense>
      </main>
    </AppShell>
  );
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
}
