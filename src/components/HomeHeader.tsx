"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon, type IconName } from "@/components/Icon";
import { PasteLinkForm } from "@/components/PasteLinkForm";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const PROFILE_LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/review", label: "Review", icon: "repeat" },
  { href: "/vocabulary", label: "My words", icon: "book" },
  { href: "/favorites", label: "Favorites", icon: "heart" },
  { href: "/account", label: "Account", icon: "user" },
];

export function HomeHeader() {
  const { user, isAvailable, signInWithGoogle } = useAuth();
  const [greeting, setGreeting] = useState("Welcome");
  const [sheet, setSheet] = useState<"add" | "profile" | null>(null);

  useEffect(() => {
    // The greeting depends on the learner's clock, so it is only known in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  const fullName = (user?.user_metadata.full_name as string | undefined) ?? "";
  const firstName = fullName.split(" ")[0] ?? "";
  const avatarUrl = user?.user_metadata.avatar_url as string | undefined;

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/85 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-xl md:px-10 md:py-4">
      <div className="flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted">{greeting}</p>
          <p className="truncate text-xl font-extrabold text-ink">{firstName || "Ready to practice?"}</p>
        </div>
        <button
          type="button"
          onClick={() => setSheet("add")}
          className="btn-3d btn-brand shrink-0 rounded-full px-3.5 py-2.5 text-sm"
          aria-label="Add a video"
        >
          <Icon name="plus" className="size-5" />
          <span className="hidden sm:inline">Add video</span>
        </button>
        <button
          type="button"
          onClick={() => setSheet("profile")}
          aria-label="Open profile"
          className="btn-3d size-11 shrink-0 overflow-hidden rounded-full p-0 md:hidden"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={44} height={44} className="size-full object-cover" />
          ) : (
            <Icon name="user" />
          )}
        </button>
      </div>

      {sheet === "add" && (
        <BottomSheet title="Add a video" onClose={() => setSheet(null)}>
          <p className="mb-3 text-sm text-muted">
            Paste a YouTube link with English subtitles. On YouTube: tap <b>Share</b> → <b>Copy link</b>.
          </p>
          <PasteLinkForm />
        </BottomSheet>
      )}

      {sheet === "profile" && (
        <BottomSheet title={fullName || "Profile"} onClose={() => setSheet(null)}>
          {user ? (
            <p className="-mt-2 mb-4 text-sm text-muted">{user.email}</p>
          ) : (
            isAvailable && (
              <button type="button" onClick={signInWithGoogle} className="btn-3d btn-brand mb-4 w-full py-3">
                Sign in with Google
              </button>
            )
          )}
          <div className="grid grid-cols-2 gap-2">
            {PROFILE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSheet(null)}
                className="flex items-center gap-2 rounded-2xl border border-line bg-cream px-3 py-3 font-semibold text-ink active:scale-[0.98]"
              >
                <Icon name={link.icon} className="size-5 text-brand" />
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-muted">Appearance</p>
          <ThemeToggle showLabels />
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/privacy" onClick={() => setSheet(null)} className="text-muted">
              Privacy Policy
            </Link>
            {user && (
              <SignOutButton className="font-semibold text-red-600">Sign out</SignOutButton>
            )}
          </div>
        </BottomSheet>
      )}
    </header>
  );
}
