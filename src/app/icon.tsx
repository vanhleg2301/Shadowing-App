import { getAppSettings } from "@/lib/app-settings";
import { renderBrandIcon } from "@/lib/brand-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const { palette, icon } = await getAppSettings();
  return renderBrandIcon(size.width, palette.icon, icon);
}
