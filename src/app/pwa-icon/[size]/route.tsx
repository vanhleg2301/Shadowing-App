import { renderBrandIcon } from "@/lib/brand-icon";

// Icons referenced by the web app manifest: /pwa-icon/192, /pwa-icon/512 and /pwa-icon/maskable.
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "maskable" }];
}

export async function GET(_request: Request, { params }: RouteContext<"/pwa-icon/[size]">) {
  const { size } = await params;
  if (size === "maskable") return renderBrandIcon(512, { padding: 80 });
  if (size === "192" || size === "512") return renderBrandIcon(Number(size));
  return new Response("Not found", { status: 404 });
}
