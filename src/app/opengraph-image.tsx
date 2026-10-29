import { ImageResponse } from "next/og";
import { ICON_SYMBOLS } from "@/data/app-icons";
import { getAppSettings } from "@/lib/app-settings";

export const alt = "Shadowing English: learn English from real videos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview (Zalo, Facebook, Messenger...): the image uploaded in Admin -> Theme, or a card in the
// current palette with the app icon.
export default async function OpenGraphImage() {
  const { palette, icon, shareImageUrl } = await getAppSettings();
  const { dark } = palette;
  return new ImageResponse(
    shareImageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element -- ImageResponse only understands plain <img>
      <img src={shareImageUrl} alt="" width={size.width} height={size.height} style={{ objectFit: "cover" }} />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: `linear-gradient(150deg, ${dark.surface} 0%, ${dark.bg} 100%)`,
          color: dark.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ width: 150, height: 150, borderRadius: 36, background: palette.icon, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {icon.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- ImageResponse only understands plain <img>
            <img src={icon.url} alt="" width={150} height={150} style={{ objectFit: "cover" }} />
          ) : (
            <svg width={84} height={84} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON_SYMBOLS[icon.symbol].path} />
            </svg>
          )}
        </div>
        <div style={{ marginTop: 50, fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>Shadowing English</div>
        <div style={{ marginTop: 20, fontSize: 40, color: dark.muted }}>Learn English from real videos and news.</div>
        <div style={{ marginTop: 14, fontSize: 40, color: dark.brand }}>Listen · Shadow · Speak</div>
      </div>
    ),
    size,
  );
}
