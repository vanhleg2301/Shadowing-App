import { ImageResponse } from "next/og";
import { ICON_SYMBOLS, type AppIconSetting } from "@/data/app-icons";

// App icon from Admin -> Theme: a white symbol on the palette's icon colour, or the uploaded image.
// `padding` leaves a safe zone for maskable icons, which Android crops into a circle.
// Inline styles are required by ImageResponse.
export function renderBrandIcon(size: number, color: string, icon: AppIconSetting, { padding = 0, rounded = true } = {}) {
  const inner = size - padding * 2;
  const radius = rounded && padding === 0 ? inner * 0.22 : 0;
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
            overflow: "hidden",
            background: color,
            borderRadius: radius,
          }}
        >
          {icon.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- ImageResponse only understands plain <img>
            <img src={icon.url} alt="" width={inner} height={inner} style={{ objectFit: "cover" }} />
          ) : (
            <svg width={inner * 0.55} height={inner * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON_SYMBOLS[icon.symbol].path} />
            </svg>
          )}
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
