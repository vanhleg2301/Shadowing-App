import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EditVideoForm } from "@/components/admin/EditVideoForm";
import { orderTopics } from "@/data/curated";
import { getAdminVideos, requireAdmin } from "@/lib/admin";

export default function AdminEditVideoPage({ params }: PageProps<"/admin/videos/[id]">) {
  return (
    <AdminLayout active="/admin/videos" title="Edit video">
      {params.then(({ id }) => (
        <EditVideo id={id} />
      ))}
    </AdminLayout>
  );
}

async function EditVideo({ id }: { id: string }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const videos = await getAdminVideos(ctx);
  const video = videos.find((v) => v.video_id === id);
  if (!video) notFound();

  return (
    <div className="mt-8 space-y-4">
      <Link href="/admin/videos" className="text-sm font-semibold text-brand">
        ← All videos
      </Link>
      <EditVideoForm video={video} topics={orderTopics(videos.map((v) => v.topic))} />
    </div>
  );
}
