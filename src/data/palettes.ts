// Colour palettes an admin can pick for the whole app (Admin -> Theme). Each one sets every colour token
// from globals.css for both light and dark mode, plus the app icon colour. Text colours were chosen to
// keep at least 4.5:1 contrast on their backgrounds.

export const PALETTE_IDS = ["graphite", "moss", "coffee", "oled", "indigo"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];
export const DEFAULT_PALETTE: PaletteId = "graphite";

type Tokens = {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  brand: string;
  "brand-dark": string;
  "brand-soft": string;
  "on-brand": string;
  accent: string;
  "accent-soft": string;
  highlight: string;
  "highlight-ink": string;
};

export interface Palette {
  id: PaletteId;
  name: string;
  description: string;
  icon: string;
  light: Tokens;
  dark: Tokens;
}

export const PALETTES: Record<PaletteId, Palette> = {
  graphite: {
    id: "graphite",
    name: "Graphite & teal",
    description: "Neutral graphite, teal buttons, amber accents.",
    icon: "#1f6f62",
    light: {
      bg: "#eef2f1", surface: "#ffffff", ink: "#142022", muted: "#5b6b68", line: "#d9e2e0",
      brand: "#0d9488", "brand-dark": "#0f766e", "brand-soft": "#d5f3ee", "on-brand": "#ffffff",
      accent: "#b45309", "accent-soft": "#fdf0d5", highlight: "#fde68a", "highlight-ink": "#241a00",
    },
    dark: {
      bg: "#111416", surface: "#1a1f22", ink: "#e6ecea", muted: "#93a29e", line: "#2a3236",
      brand: "#2dd4bf", "brand-dark": "#0d9488", "brand-soft": "#16332f", "on-brand": "#06201c",
      accent: "#fbbf24", "accent-soft": "#3a2e12", highlight: "#a16207", "highlight-ink": "#fffbea",
    },
  },
  moss: {
    id: "moss",
    name: "Moss & green",
    description: "Deep moss green, fresh green buttons, lemon accents.",
    icon: "#166534",
    light: {
      bg: "#eef3ef", surface: "#ffffff", ink: "#13201a", muted: "#5a6b61", line: "#d8e3db",
      brand: "#15803d", "brand-dark": "#166534", "brand-soft": "#dcf3e3", "on-brand": "#ffffff",
      accent: "#a16207", "accent-soft": "#fdf3c7", highlight: "#fde68a", "highlight-ink": "#241a00",
    },
    dark: {
      bg: "#0e1512", surface: "#16211c", ink: "#e4efe8", muted: "#91a69a", line: "#26352d",
      brand: "#4ade80", "brand-dark": "#16a34a", "brand-soft": "#173323", "on-brand": "#052e16",
      accent: "#facc15", "accent-soft": "#3a3410", highlight: "#a16207", "highlight-ink": "#fffbea",
    },
  },
  coffee: {
    id: "coffee",
    name: "Coffee & orange",
    description: "Warm dark brown, earthy orange buttons, peach accents.",
    icon: "#9a3412",
    light: {
      bg: "#f6f1ec", surface: "#ffffff", ink: "#2a1d14", muted: "#75655a", line: "#e7ddd3",
      brand: "#c2410c", "brand-dark": "#9a3412", "brand-soft": "#fde7d7", "on-brand": "#ffffff",
      accent: "#be185d", "accent-soft": "#fce4ef", highlight: "#fed7aa", "highlight-ink": "#2a1206",
    },
    dark: {
      bg: "#15110e", surface: "#211a15", ink: "#f1e8df", muted: "#b09e8e", line: "#3a2f27",
      brand: "#fb923c", "brand-dark": "#c2410c", "brand-soft": "#3b2516", "on-brand": "#2a1206",
      accent: "#f9a8d4", "accent-soft": "#3a2030", highlight: "#9a3412", "highlight-ink": "#fff4ec",
    },
  },
  oled: {
    id: "oled",
    name: "Black & fuchsia",
    description: "Near-black (saves battery on OLED), fuchsia buttons, cyan accents.",
    icon: "#86198f",
    light: {
      bg: "#f4f4f7", surface: "#ffffff", ink: "#16161d", muted: "#60606f", line: "#e0e0e8",
      brand: "#a21caf", "brand-dark": "#86198f", "brand-soft": "#f8e3fb", "on-brand": "#ffffff",
      accent: "#0e7490", "accent-soft": "#d7f3f8", highlight: "#f5d0fe", "highlight-ink": "#2b0530",
    },
    dark: {
      bg: "#08080b", surface: "#131318", ink: "#ececf1", muted: "#9a9aaa", line: "#26262f",
      brand: "#e879f9", "brand-dark": "#a21caf", "brand-soft": "#2e1533", "on-brand": "#1a0420",
      accent: "#22d3ee", "accent-soft": "#0f2d33", highlight: "#86198f", "highlight-ink": "#fdf4ff",
    },
  },
  indigo: {
    id: "indigo",
    name: "Navy & indigo",
    description: "The original look: deep navy, indigo buttons, coral accents.",
    icon: "#3730a3",
    light: {
      bg: "#eef0f7", surface: "#ffffff", ink: "#161a2e", muted: "#5f6684", line: "#dde0ee",
      brand: "#4f46e5", "brand-dark": "#3730a3", "brand-soft": "#e4e5fc", "on-brand": "#ffffff",
      accent: "#e85d43", "accent-soft": "#fde6e0", highlight: "#fde68a", "highlight-ink": "#241a00",
    },
    dark: {
      bg: "#0d0f1e", surface: "#171a2f", ink: "#e8eaf7", muted: "#9ba1c2", line: "#2a2e4a",
      brand: "#818cf8", "brand-dark": "#4f46e5", "brand-soft": "#232653", "on-brand": "#0d0f1e",
      accent: "#ff8a70", "accent-soft": "#3b2128", highlight: "#b45309", "highlight-ink": "#fff8e6",
    },
  },
};

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && (PALETTE_IDS as readonly string[]).includes(value);
}

function toDeclarations(tokens: Tokens): string {
  return Object.entries(tokens)
    .map(([name, value]) => `--${name}:${value};`)
    .join("");
}

// CSS that overrides the defaults in globals.css; same selectors, injected after the stylesheet.
export function getPaletteCss(palette: Palette): string {
  return `:root{${toDeclarations(palette.light)}}:root[data-theme="dark"]{${toDeclarations(palette.dark)}}`;
}
