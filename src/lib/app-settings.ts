import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_PALETTE, PALETTES, isPaletteId, type Palette } from "@/data/palettes";
import { createPublicClient } from "./supabase/admin";

export const APP_SETTINGS_TAG = "app-settings";

// The palette chosen in Admin -> Theme; the default when nothing is saved or the table is missing.
export async function getPalette(): Promise<Palette> {
  "use cache";
  cacheLife("days");
  cacheTag(APP_SETTINGS_TAG);

  const supabase = createPublicClient();
  if (!supabase) return PALETTES[DEFAULT_PALETTE];
  const { data } = await supabase.from("app_settings").select("value").eq("key", "palette").maybeSingle();
  const id = (data as { value: unknown } | null)?.value;
  return PALETTES[isPaletteId(id) ? id : DEFAULT_PALETTE];
}
