import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";

interface NavItem {
  label: string;
  icon: IconName;
  href?: string;
  iconClass: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: "home", href: "/", iconClass: "text-orange-500" },
  { label: "Listening", icon: "headphones", iconClass: "text-sky-500" },
  { label: "Speaking", icon: "mic", iconClass: "text-teal-500" },
  { label: "Vocabulary", icon: "book", iconClass: "text-pink-500" },
  { label: "Favorites", icon: "heart", iconClass: "text-rose-500" },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-5 md:flex">
        <Link href="/" className="flex items-center gap-2 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-white shadow-[0_3px_0_0_var(--color-brand-dark)]">
            <Icon name="mic" />
          </span>
          <span className="text-xl font-extrabold text-brand">Shadowing</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className="btn-3d btn-brand justify-start px-4 py-3">
                <Icon name={item.icon} className="size-6" />
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="flex items-center gap-1.5 rounded-2xl px-4 py-3 font-semibold text-ink/60"
                title="Coming soon"
              >
                <Icon name={item.icon} className={`size-6 ${item.iconClass}`} />
                {item.label}
                <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium text-muted">Soon</span>
              </span>
            ),
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href ?? "/"}
            aria-disabled={!item.href}
            className={`flex flex-col items-center gap-0.5 px-2 text-[11px] font-semibold ${
              item.href ? "text-brand" : "pointer-events-none text-muted/60"
            }`}
          >
            <Icon name={item.icon} className={`size-6 ${item.href ? "" : item.iconClass + " opacity-50"}`} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
