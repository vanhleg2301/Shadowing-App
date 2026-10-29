import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PalettePicker } from "@/components/admin/PalettePicker";
import { requireAdmin } from "@/lib/admin";
import { getPalette } from "@/lib/app-settings";

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
  const palette = await getPalette();
  return <PalettePicker currentId={palette.id} />;
}
