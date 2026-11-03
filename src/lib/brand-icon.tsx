import { ImageResponse } from "next/og";
import { SymbolArt } from "@/components/SymbolArt";
import { type AppIconSetting } from "@/data/app-icons";

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
            <SymbolArt symbol={icon.symbol} color="white" size={inner * 0.6} />
          )}
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
