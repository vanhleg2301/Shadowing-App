"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/Icon";

export interface SidebarItem {
  label: string;
  icon: IconName;
  href: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

interface SidebarNavProps {
  groups: SidebarGroup[];
  active: string;
}

const STORAGE_KEY = "sidebar-collapsed";

// The sidebar's modules, each collapsible. Choices are remembered on this device, and the current page's module
// always stays open so the learner can see where they are.
export function SidebarNav({ groups, active }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      if (Array.isArray(stored)) setCollapsed(stored.filter((g): g is string => typeof g === "string"));
    } catch {
      // Keep every module open.
    }
  }, []);

  const toggle = (label: string) => {
    const next = collapsed.includes(label) ? collapsed.filter((g) => g !== label) : [...collapsed, label];
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode: the change still applies for this visit.
    }
  };

  return (
    <>
      {groups.map((group) => {
        const hasActive = group.items.some((item) => item.href === active);
        const isOpen = hasActive || !collapsed.includes(group.label);
        return (
          <div key={group.label} className="mb-2">
            <button
              type="button"
              onClick={() => toggle(group.label)}
              disabled={hasActive}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted transition-colors enabled:hover:bg-cream enabled:hover:text-ink"
            >
              {group.label}
              {!hasActive && <Icon name="chevronDown" className={`size-4 transition-transform ${isOpen ? "" : "-rotate-90"}`} />}
            </button>
            {isOpen && (
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
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
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
