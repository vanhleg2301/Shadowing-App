import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BrandingSettings } from "@/components/admin/BrandingSettings";
import { PalettePicker } from "@/components/admin/PalettePicker";
import { requireAdmin } from "@/lib/admin";
import { getAppSettings } from "@/lib/app-settings";

export default function AdminThemePage() {
  return (
    <AdminLayout active="/admin/theme" title="Theme">
      <ThemeSettings />
    </AdminLayout>
  );
}

async function ThemeSettings() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { palette, icon, shareImageUrl } = await getAppSettings();
  return (
    <>
      <PalettePicker currentId={palette.id} />
      <BrandingSettings icon={icon} iconColor={palette.icon} shareImageUrl={shareImageUrl} />
    </>
  );
}
