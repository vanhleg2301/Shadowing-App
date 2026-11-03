import { ICON_SYMBOLS, type IconSymbol, type SymbolDef } from "@/data/app-icons";

interface SymbolArtProps {
  symbol: IconSymbol;
  color?: string;
  size?: number;
  className?: string;
  // Line width for the 24px line symbols; logo marks carry their own.
  lineWidth?: number;
}

// Draws an app icon symbol. Also used inside ImageResponse, so it sticks to plain SVG attributes.
export function SymbolArt({ symbol, color = "currentColor", size, className, lineWidth = 2.2 }: SymbolArtProps) {
  const def: SymbolDef = ICON_SYMBOLS[symbol];
  if ("path" in def) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth={lineWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={def.path} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      {def.shapes.map((shape, i) =>
        shape.strokeWidth ? (
          <path key={i} d={shape.d} fill="none" stroke={color} strokeWidth={shape.strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity={shape.opacity} />
        ) : (
          <path key={i} d={shape.d} fill={color} opacity={shape.opacity} />
        ),
      )}
    </svg>
  );
}
