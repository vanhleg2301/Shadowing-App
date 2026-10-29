"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { resetShareImage, setIconSymbol, uploadBrandImage, type AdminResult } from "@/app/admin/actions";
import { ICON_SYMBOL_IDS, ICON_SYMBOLS, type AppIconSetting, type IconSymbol } from "@/data/app-icons";

interface BrandingSettingsProps {
  icon: AppIconSetting;
  iconColor: string;
  shareImageUrl: string | null;
}

const MIN_ICON_PX = 512;

function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

// App icon (a ready-made symbol or an uploaded image) and the link-preview image, in Admin -> Theme.
export function BrandingSettings({ icon, iconColor, shareImageUrl }: BrandingSettingsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<AdminResult>, done: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? { text: done, isError: false } : { text: result.error, isError: true });
      if (result.ok) router.refresh();
    });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, target: "icon" | "share") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const dimensions = await readImageSize(file);
    if (!dimensions) {
      setMessage({ text: "That file isn't an image the browser can read.", isError: true });
      return;
    }
    if (target === "icon" && (dimensions.width < MIN_ICON_PX || dimensions.height < MIN_ICON_PX)) {
      setMessage({ text: `The icon must be at least ${MIN_ICON_PX}×${MIN_ICON_PX} pixels.`, isError: true });
      return;
    }
    const formData = new FormData();
    formData.set("target", target);
    formData.set("file", file);
    run(() => uploadBrandImage(formData), target === "icon" ? "Icon uploaded." : "Link preview image uploaded.");
  };

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="text-xl font-extrabold text-ink">App icon</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Pick a symbol (drawn on the palette&apos;s icon colour) or upload a square image of at least 512×512 px (PNG, JPG or
          WebP, up to 2 MB). Android crops icons into a circle, so keep the important part in the middle.
        </p>
        <div role="radiogroup" aria-label="Icon symbol" className="mt-4 flex flex-wrap gap-3">
          {ICON_SYMBOL_IDS.map((id) => {
            const isCurrent = icon.kind === "symbol" && icon.symbol === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isCurrent}
                disabled={isPending}
                onClick={() => run(() => setIconSymbol({ symbol: id }), "Icon updated.")}
                className={`flex w-24 flex-col items-center gap-2 rounded-2xl border-2 bg-surface p-3 text-xs font-semibold text-ink ${
                  isCurrent ? "border-brand" : "border-line hover:border-muted"
                }`}
              >
                <SymbolTile symbol={id} color={iconColor} />
                {ICON_SYMBOLS[id].label}
              </button>
            );
          })}
          <label
            className={`flex w-24 cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 bg-surface p-3 text-xs font-semibold text-ink ${
              icon.kind === "image" ? "border-brand" : "border-dashed border-line hover:border-muted"
            }`}
          >
            {icon.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
              <img src={icon.url} alt="Uploaded icon" className="size-12 rounded-xl object-cover" />
            ) : (
              <span className="grid size-12 place-items-center rounded-xl bg-cream text-2xl text-muted">+</span>
            )}
            {icon.kind === "image" ? "Your image" : "Upload…"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={isPending} onChange={(e) => handleUpload(e, "icon")} />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-ink">Link preview image</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Shown when the app&apos;s link is shared on Zalo, Facebook or Messenger. Without an upload, a card in the current
          palette with the app icon is used. Best size 1200×630 px, up to 5 MB. Apps that already cached the old preview can
          take a few days to update.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {shareImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
            <img src={shareImageUrl} alt="Current link preview" className="aspect-[1200/630] w-72 rounded-2xl border border-line object-cover" />
          ) : (
            <span className="grid aspect-[1200/630] w-72 place-items-center rounded-2xl border border-dashed border-line text-sm text-muted">
              Generated card
            </span>
          )}
          <div className="flex flex-col gap-2">
            <label className="btn-3d btn-brand cursor-pointer px-4 py-2 text-sm">
              Upload image
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={isPending} onChange={(e) => handleUpload(e, "share")} />
            </label>
            {shareImageUrl && (
              <button type="button" disabled={isPending} onClick={() => run(() => resetShareImage(), "Back to the generated card.")} className="btn-3d px-4 py-2 text-sm">
                Use generated card
              </button>
            )}
          </div>
        </div>
      </section>

      {(isPending || message) && (
        <p className={`text-sm font-semibold ${message?.isError ? "text-red-600" : "text-ink"}`} aria-live="polite">
          {isPending ? "Saving..." : message?.text}
        </p>
      )}
    </div>
  );
}

function SymbolTile({ symbol, color }: { symbol: IconSymbol; color: string }) {
  return (
    <span className="grid size-12 place-items-center rounded-xl" style={{ background: color }} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d={ICON_SYMBOLS[symbol].path} />
      </svg>
    </span>
  );
}
