// App icon choices for Admin -> Theme: a ready-made symbol drawn in white on the palette's icon colour,
// or an image the admin uploads.

export const ICON_SYMBOLS = {
  mic: { label: "Microphone", path: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" },
  headphones: { label: "Headphones", path: "M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zm16 0h-3v6h2a1 1 0 0 0 1-1z" },
  chat: { label: "Chat", path: "M4 5h16v11H10l-5 4v-4H4zM8 10h8M8 13h5" },
  book: { label: "Book", path: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21a2 2 0 0 1 2-2h13" },
  wave: { label: "Sound wave", path: "M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2" },
} as const;

export type IconSymbol = keyof typeof ICON_SYMBOLS;
export const ICON_SYMBOL_IDS = Object.keys(ICON_SYMBOLS) as IconSymbol[];

export type AppIconSetting = { kind: "symbol"; symbol: IconSymbol } | { kind: "image"; url: string };

export const DEFAULT_APP_ICON: AppIconSetting = { kind: "symbol", symbol: "mic" };

export function parseAppIcon(value: unknown): AppIconSetting {
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (v.kind === "symbol" && typeof v.symbol === "string" && v.symbol in ICON_SYMBOLS) {
      return { kind: "symbol", symbol: v.symbol as IconSymbol };
    }
    if (v.kind === "image" && typeof v.url === "string" && v.url.startsWith("https://")) return { kind: "image", url: v.url };
  }
  return DEFAULT_APP_ICON;
}
