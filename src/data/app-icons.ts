// App icon choices for Admin -> Theme: a ready-made symbol drawn in white on the palette's icon colour,
// or an image the admin uploads.

// Line symbols are one stroked path on a 24px grid. Logo marks are filled shapes on a 64px grid; a shape
// with `strokeWidth` is drawn as a line instead, and `opacity` makes the softer "shadow" parts.
export interface MarkShape {
  d: string;
  opacity?: number;
  strokeWidth?: number;
}
export type SymbolDef = { label: string; path: string } | { label: string; shapes: readonly MarkShape[] };

// Path for a 6px-wide bar with round ends, from its top-left corner.
const bar = (x: number, y: number, h: number) => `M${x} ${y + 3}a3 3 0 0 1 6 0v${h - 6}a3 3 0 0 1-6 0z`;
const bars = (list: [number, number, number][]) => list.map(([x, y, h]) => bar(x, y, h)).join("");
const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}z`;

const FRONT_BUBBLE = roundRect(8, 10, 32, 24, 9) + "M16 32L11 43L25 33Z";
const WAVE = [[9, 26, 12], [19, 18, 28], [29, 11, 42], [39, 20, 24], [49, 27, 10]] as [number, number, number][];
const S_PATH = "M40 15A10 10 0 1 0 32 32A10 10 0 1 1 24 49";

export const ICON_SYMBOLS = {
  waveReflection: {
    label: "Wave and reflection",
    shapes: [
      { d: bars([[9, 24, 12], [19, 14, 22], [29, 6, 30], [39, 16, 20], [49, 25, 11]]) },
      { d: bars([[9, 41, 7], [19, 41, 13], [29, 41, 17], [39, 41, 12], [49, 41, 7]]), opacity: 0.38 },
    ],
  },
  waveShadow: {
    label: "Wave with shadow",
    shapes: [{ d: bars(WAVE.map(([x, y, h]) => [x + 4, y + 4, h])), opacity: 0.4 }, { d: bars(WAVE) }],
  },
  bubbles: {
    label: "Two bubbles",
    shapes: [{ d: roundRect(24, 22, 32, 24, 9) + "M48 44L53 55L40 45Z", opacity: 0.42 }, { d: FRONT_BUBBLE }],
  },
  bubbleOutline: {
    label: "Bubble and outline",
    shapes: [{ d: "M33 22H47A9 9 0 0 1 56 31V37A9 9 0 0 1 47 46H44L52 55L38 46H33A9 9 0 0 1 24 37V31A9 9 0 0 1 33 22Z", strokeWidth: 4 }, { d: FRONT_BUBBLE }],
  },
  sShadow: {
    label: "S with shadow",
    shapes: [{ d: "M44 19A10 10 0 1 0 36 36A10 10 0 1 1 28 53", strokeWidth: 8, opacity: 0.4 }, { d: S_PATH, strokeWidth: 8 }],
  },
  sTwoTone: {
    label: "Two-tone S",
    shapes: [
      { d: "M41 16A10 10 0 1 0 32 32", strokeWidth: 8 },
      { d: "M32 32A10 10 0 1 1 23 48", strokeWidth: 8, opacity: 0.42 },
      { d: "M28 32a4 4 0 1 0 8 0a4 4 0 1 0-8 0z" },
    ],
  },
  mic: { label: "Microphone", path: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" },
  headphones: { label: "Headphones", path: "M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zm16 0h-3v6h2a1 1 0 0 0 1-1z" },
  chat: { label: "Chat", path: "M4 5h16v11H10l-5 4v-4H4zM8 10h8M8 13h5" },
  book: { label: "Book", path: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21a2 2 0 0 1 2-2h13" },
  wave: { label: "Sound wave", path: "M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2" },
} as const satisfies Record<string, SymbolDef>;

export type IconSymbol = keyof typeof ICON_SYMBOLS;
export const ICON_SYMBOL_IDS = Object.keys(ICON_SYMBOLS) as IconSymbol[];

export type AppIconSetting = { kind: "symbol"; symbol: IconSymbol } | { kind: "image"; url: string };

export const DEFAULT_APP_ICON: AppIconSetting = { kind: "symbol", symbol: "waveReflection" };

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
