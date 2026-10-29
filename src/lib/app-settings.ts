import { cacheLife, cacheTag } from "next/cache";
import { parseAppIcon, type AppIconSetting } from "@/data/app-icons";
import { DEFAULT_PALETTE, PALETTES, isPaletteId, type Palette } from "@/data/palettes";
import { createPublicClient } from "./supabase/admin";

export const APP_SETTINGS_TAG = "app-settings";

export interface AppSettings {
  palette: Palette;
  icon: AppIconSetting;
  // Uploaded link-preview image; null uses the generated one.
  shareImageUrl: string | null;
}

// Everything chosen in Admin -> Theme, with defaults when nothing is saved or the table is missing.
export async function getAppSettings(): Promise<AppSettings> {
  "use cache";
  cacheLife("days");
  cacheTag(APP_SETTINGS_TAG);

  const supabase = createPublicClient();
  const rows = supabase
    ? (((await supabase.from("app_settings").select("key, value").in("key", ["palette", "icon", "share_image"])).data ?? []) as {
        key: string;
        value: unknown;
      }[])
    : [];
  const valueOf = (key: string) => rows.find((r) => r.key === key)?.value;
  const paletteId = valueOf("palette");
  const shareImage = valueOf("share_image");
  return {
    palette: PALETTES[isPaletteId(paletteId) ? paletteId : DEFAULT_PALETTE],
    icon: parseAppIcon(valueOf("icon")),
    shareImageUrl: typeof shareImage === "string" && shareImage.startsWith("https://") ? shareImage : null,
  };
}

export async function getPalette(): Promise<Palette> {
  return (await getAppSettings()).palette;
}
