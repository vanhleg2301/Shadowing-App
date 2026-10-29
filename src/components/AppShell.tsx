import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AuthButton } from "@/components/AuthButton";
import { Icon, type IconName } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ICON_SYMBOLS } from "@/data/app-icons";
import { isAdminEmail } from "@/lib/admin-emails";
import { getAppSettings } from "@/lib/app-settings";
import { getUserContext } from "@/lib/user-data";

interface NavItem {
  label: string;
  shortLabel: string;
  icon: IconName;
  href: string;
  // The phone tab bar has room for five; the rest stay in the sidebar and the profile menu.
  isDesktopOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", shortLabel: "Home", icon: "home", href: "/" },
  { label: "Daily stories", shortLabel: "Stories", icon: "chat", href: "/stories" },
  { label: "News", shortLabel: "News", icon: "news", href: "/news", isDesktopOnly: true },
  { label: "7-day course", shortLabel: "Course", icon: "course", href: "/course" },
  { label: "Review", shortLabel: "Review", icon: "repeat", href: "/review" },
  { label: "My words", shortLabel: "Words", icon: "book", href: "/vocabulary" },
  { label: "Search phrases", shortLabel: "Search", icon: "search", href: "/search", isDesktopOnly: true },
  { label: "Favorites", shortLabel: "Favorites", icon: "heart", href: "/favorites", isDesktopOnly: true },
  { label: "Offline lessons", shortLabel: "Offline", icon: "news", href: "/offline", isDesktopOnly: true },
];

interface AppShellProps {
  active: string;
  children: ReactNode;
}

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        <Link href="/" className="flex items-center gap-2 px-2">
          <Suspense fallback={<span className="size-10 rounded-xl bg-brand" />}>
            <BrandMark />
          </Suspense>
          <span className="text-xl font-extrabold text-ink">
            Shadow<span className="text-brand">ing</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-colors ${
                  isActive ? "bg-brand-soft text-brand" : "text-ink/80 hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            );
          })}
          <Suspense fallback={null}>
            <AdminNavLink isActive={active === "/admin"} />
          </Suspense>
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <ThemeToggle />
          <AuthButton variant="full" />
          <div className="flex gap-3 px-2 text-xs text-muted">
            <Link href="/account" className="hover:text-ink">
              Account
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
        </div>
      </aside>

      {/* Leaves room for the floating tab bar plus the iPhone home indicator. */}
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(env(safe-area-inset-bottom)+6rem)] md:pb-0">
        {/* Each page renders its own AppShell, so every navigation mounts this again and the content rises in;
            the sidebar and bottom bar stay put. */}
        <div className="flex flex-1 animate-page-in flex-col">{children}</div>
      </div>

      <nav
        aria-label="Main"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-40 flex justify-around rounded-[1.75rem] border border-line bg-surface/90 p-1.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] backdrop-blur-xl md:hidden"
      >
        {NAV_ITEMS.filter((item) => !item.isDesktopOnly).map((item) => {
          const isActive = item.href === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.4rem] py-2 text-[11px] font-semibold transition-colors ${
                isActive ? "bg-brand-soft text-brand" : "text-muted active:bg-cream"
              }`}
            >
              <Icon name={item.icon} className="size-6" />
              {item.shortLabel}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Streams in after the static shell, only for the two admin accounts.
async function AdminNavLink({ isActive }: { isActive: boolean }) {
  const ctx = await getUserContext().catch(() => null);
  if (!ctx || !isAdminEmail(ctx.user.email)) return null;
  return (
    <Link
      href="/admin"
      aria-current={isActive ? "page" : undefined}
      className={`mt-3 flex items-center gap-3 rounded-2xl border border-dashed px-4 py-3 font-semibold transition-colors ${
        isActive ? "border-brand bg-brand-soft text-brand" : "border-line text-ink/80 hover:bg-cream"
      }`}
    >
      <Icon name="chart" className="size-5" />
      Admin
    </Link>
  );
}

// The sidebar logo follows the icon chosen in Admin -> Theme.
async function BrandMark() {
  const { icon } = await getAppSettings();
  if (icon.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element -- small uploaded logo; the URL changes on every upload
    return <img src={icon.url} alt="" className="size-10 rounded-xl object-cover shadow-[0_3px_0_0_var(--color-brand-dark)]" />;
  }
  return (
    <span className="grid size-10 place-items-center rounded-xl bg-brand text-on-brand shadow-[0_3px_0_0_var(--color-brand-dark)]">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICON_SYMBOLS[icon.symbol].path} />
      </svg>
    </span>
  );
}
