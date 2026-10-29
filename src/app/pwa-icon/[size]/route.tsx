import { getAppSettings } from "@/lib/app-settings";
import { renderBrandIcon } from "@/lib/brand-icon";

// Icons referenced by the web app manifest: /pwa-icon/192, /pwa-icon/512 and /pwa-icon/maskable.
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "maskable" }];
}

export async function GET(_request: Request, { params }: RouteContext<"/pwa-icon/[size]">) {
  const [{ size }, { palette, icon }] = await Promise.all([params, getAppSettings()]);
  if (size === "maskable") return renderBrandIcon(512, palette.icon, icon, { padding: 80 });
  if (size === "192" || size === "512") return renderBrandIcon(Number(size), palette.icon, icon);
  return new Response("Not found", { status: 404 });
}
