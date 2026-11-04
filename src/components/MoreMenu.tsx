"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AuthButton } from "@/components/AuthButton";
import { BottomSheet } from "@/components/BottomSheet";
import { Icon } from "@/components/Icon";
import type { SidebarGroup } from "@/components/SidebarNav";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MoreMenuProps {
  groups: SidebarGroup[];
  active: string;
  adminLink: ReactNode;
}

const LINK_CLASS = "flex items-center gap-2 rounded-2xl border border-line px-3 py-3 font-semibold active:scale-[0.98]";

// The phone tab bar's last tab: everything from the sidebar that has no tab of its own.
export function MoreMenu({ groups, active, adminLink }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const isActive =
    active === "/account" || active === "/about" || groups.some((group) => group.items.some((item) => item.href === active));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1.4rem] py-2 text-[11px] font-semibold transition-colors ${
          isActive ? "bg-brand-soft text-brand" : "text-muted active:bg-cream"
        }`}
      >
        <Icon name="menu" className="size-6" />
        More
      </button>
      {isOpen && (
        <BottomSheet title="More" onClose={close}>
          {groups.map((group) => (
            <section key={group.label} className="mb-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{group.label}</h3>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={item.href === active ? "page" : undefined}
                    className={`${LINK_CLASS} ${item.href === active ? "border-brand bg-brand-soft text-brand" : "bg-cream text-ink"}`}
                  >
                    <Icon name={item.icon} className="size-5 text-brand" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
          {adminLink}
          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-muted">Appearance</p>
          <ThemeToggle showLabels />
          <div className="mt-5">
            <AuthButton variant="full" />
          </div>
          <div className="mt-4 flex gap-4 text-sm text-muted">
            <Link href="/account" onClick={close}>
              Account
            </Link>
            <Link href="/about" onClick={close}>
              About
            </Link>
            <Link href="/privacy" onClick={close}>
              Privacy
            </Link>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
