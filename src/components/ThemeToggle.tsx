"use client";

import { useTheme } from "@/hooks/useTheme";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" },
  { value: "dark", label: "Dark", icon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" },
  { value: "system", label: "System", icon: "M4 5h16v11H4zM8 20h8M12 16v4" },
];

interface ThemeToggleProps {
  showLabels?: boolean;
}

export function ThemeToggle({ showLabels = false }: ThemeToggleProps) {
  const { preference, changePreference } = useTheme();

  return (
    <div role="radiogroup" aria-label="Theme" className="flex gap-1 rounded-2xl border border-line bg-surface p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={preference === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => changePreference(option.value)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            preference === option.value ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={option.icon} />
          </svg>
          {showLabels && option.label}
        </button>
      ))}
    </div>
  );
}
