import { renderBrandIcon } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the square is drawn edge to edge.
export default function AppleIcon() {
  return renderBrandIcon(size.width, { rounded: false });
}
