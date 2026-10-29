"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setPalette } from "@/app/admin/actions";
import { PALETTE_IDS, PALETTES, type Palette, type PaletteId } from "@/data/palettes";

interface PalettePickerProps {
  currentId: PaletteId;
}

// Pick the colours for the whole app and its icon. Each card previews the palette in dark and light.
export function PalettePicker({ currentId }: PalettePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<PaletteId>(currentId);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await setPalette({ paletteId: selected });
      if (!result.ok) {
        setMessage(`Couldn't save: ${result.error}`);
        return;
      }
      setMessage("Saved. Everyone sees the new colours on their next page load.");
      router.refresh();
    });
  };

  return (
    <div className="mt-8 space-y-5">
      <p className="max-w-2xl text-sm text-muted">
        Changes the colours of the whole app and the app icon for every learner. Installed apps on Android update their
        icon within a few days; on iPhone the home-screen icon only changes after the app is removed and added again.
      </p>
      <div role="radiogroup" aria-label="Palette" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PALETTE_IDS.map((id) => (
          <PaletteCard key={id} palette={PALETTES[id]} isSelected={selected === id} isCurrent={currentId === id} onSelect={() => setSelected(id)} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} disabled={isPending || selected === currentId} className="btn-3d btn-brand px-5 py-2.5">
          {isPending ? "Saving..." : "Save palette"}
        </button>
        {message && <p className="text-sm font-semibold text-ink">{message}</p>}
      </div>
    </div>
  );
}

interface PaletteCardProps {
  palette: Palette;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}

function PaletteCard({ palette, isSelected, isCurrent, onSelect }: PaletteCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`rounded-3xl border-2 bg-surface p-4 text-left transition-colors ${isSelected ? "border-brand" : "border-line hover:border-muted"}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: palette.icon }} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">
            {palette.name}
            {isCurrent && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">In use</span>}
          </span>
          <span className="block text-sm text-muted">{palette.description}</span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Preview tokens={palette.dark} label="Dark" />
        <Preview tokens={palette.light} label="Light" />
      </div>
    </button>
  );
}

// A miniature screen drawn with the palette's own colours (inline, since they aren't the active theme).
function Preview({ tokens, label }: { tokens: Palette["dark"]; label: string }) {
  return (
    <span className="block rounded-2xl p-2.5" style={{ background: tokens.bg, border: `1px solid ${tokens.line}` }}>
      <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: tokens.accent }}>
        {label}
      </span>
      <span className="mt-1 block rounded-lg p-2" style={{ background: tokens.surface, border: `1px solid ${tokens.line}` }}>
        <span className="block text-xs font-bold" style={{ color: tokens.ink }}>
          Small talk
        </span>
        <span className="block text-[10px]" style={{ color: tokens.muted }}>
          Listen, then shadow
        </span>
        <span className="mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: tokens.brand, color: tokens["on-brand"] }}>
          Start
        </span>
      </span>
    </span>
  );
}
