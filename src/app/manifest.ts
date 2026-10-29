import type { MetadataRoute } from "next";
import { getPalette } from "@/lib/app-settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const palette = await getPalette();
  return {
    name: "Shadowing English",
    short_name: "Shadowing",
    description: "Learn everyday English with videos: synced subtitles, tap-to-look-up words and shadowing.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: palette.light.bg,
    theme_color: palette.icon,
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
