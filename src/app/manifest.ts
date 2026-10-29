import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shadowing English",
    short_name: "Shadowing",
    description: "Learn everyday English with videos: synced subtitles, tap-to-look-up words and shadowing.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eef2f1",
    theme_color: "#1f6f62",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
