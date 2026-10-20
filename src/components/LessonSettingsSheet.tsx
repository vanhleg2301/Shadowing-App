"use client";

import { BottomSheet } from "@/components/BottomSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { LessonPrefs, TextSize } from "@/hooks/useLessonPrefs";

interface LessonSettingsSheetProps {
  prefs: LessonPrefs;
  hasTranslation: boolean;
  onChange: (patch: Partial<LessonPrefs>) => void;
  onClose: () => void;
}

const SIZES: { value: TextSize; label: string; className: string }[] = [
  { value: "sm", label: "Aa", className: "text-sm" },
  { value: "md", label: "Aa", className: "text-base" },
  { value: "lg", label: "Aa", className: "text-xl" },
];

function Toggle({ label, hint, checked, disabled, onChange }: { label: string; hint: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={`flex items-center justify-between gap-4 py-3 ${disabled ? "opacity-40" : ""}`}>
      <span>
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-line"}`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-[left] ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

export function LessonSettingsSheet({ prefs, hasTranslation, onChange, onClose }: LessonSettingsSheetProps) {
  return (
    <BottomSheet title="Display" onClose={onClose}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Text size</p>
      <div role="radiogroup" aria-label="Text size" className="flex gap-1 rounded-2xl border border-line bg-cream p-1">
        {SIZES.map((size) => (
          <button
            key={size.value}
            type="button"
            role="radio"
            aria-checked={prefs.textSize === size.value}
            aria-label={`Text size ${size.value}`}
            onClick={() => onChange({ textSize: size.value })}
            className={`flex-1 rounded-xl py-2 font-bold transition-colors ${size.className} ${
              prefs.textSize === size.value ? "bg-surface text-brand shadow-sm" : "text-muted"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>

      <div className="mt-3 divide-y divide-line">
        <Toggle
          label="Listen first"
          hint="Hide the transcript; tap a line to reveal it"
          checked={prefs.hideText}
          onChange={(hideText) => onChange({ hideText })}
        />
        <Toggle
          label="Follow along"
          hint="Keep the current sentence in view"
          checked={prefs.autoScroll}
          onChange={(autoScroll) => onChange({ autoScroll })}
        />
        <Toggle
          label="Vietnamese translation"
          hint={hasTranslation ? "Show under each sentence" : "Not available for this video"}
          checked={hasTranslation && prefs.showTranslation}
          disabled={!hasTranslation}
          onChange={(showTranslation) => onChange({ showTranslation })}
        />
      </div>

      <p className="mb-2 mt-3 text-xs font-bold uppercase tracking-wide text-muted">Theme</p>
      <ThemeToggle showLabels />
    </BottomSheet>
  );
}
