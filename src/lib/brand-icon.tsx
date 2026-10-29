import { ImageResponse } from "next/og";

// App icon: white microphone on the palette's icon colour (Admin -> Theme). `padding` leaves a safe zone
// for maskable icons, which Android crops into a circle. Inline styles are required by ImageResponse.
export function renderBrandIcon(size: number, color: string, { padding = 0, rounded = true } = {}) {
  const inner = size - padding * 2;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: padding > 0 || !rounded ? color : "transparent",
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: color,
            borderRadius: rounded && padding === 0 ? inner * 0.22 : 0,
          }}
        >
          <svg width={inner * 0.55} height={inner * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
