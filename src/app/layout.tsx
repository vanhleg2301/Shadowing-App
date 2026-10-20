import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { TimeZoneSync } from "@/components/TimeZoneSync";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shadowing English",
  description: "Learn English with videos: synced subtitles, tap-to-look-up words and sentence-by-sentence shadowing.",
  appleWebApp: { capable: true, title: "Shadowing", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // Lets the layout reach the screen edges so env(safe-area-inset-*) reports the iPhone notch and home bar.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by the inline script before hydration, so React must not warn about it.
    <html lang="en" className={`${beVietnamPro.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <TimeZoneSync />
      </body>
    </html>
  );
}
