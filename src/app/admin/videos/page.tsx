import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteVideo, setVideoPublished } from "@/app/admin/actions";
import { AddVideoForm } from "@/components/admin/AddVideoForm";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination, AdminSearchBox } from "@/components/admin/AdminListControls";
import { orderTopics } from "@/data/curated";
import { getThumbnailUrl } from "@/lib/media";
import { ADMIN_PAGE_SIZE, getAdminVideos, parsePage, parseQuery, requireAdmin } from "@/lib/admin";

export default function AdminVideosPage({ searchParams }: PageProps<"/admin/videos">) {
  return (
    <AdminLayout active="/admin/videos" title="Videos">
      {searchParams.then((sp) => (
        <VideoTable page={parsePage(sp.page)} query={parseQuery(sp.q)} />
      ))}
    </AdminLayout>
  );
}

async function VideoTable({ page, query }: { page: number; query: string }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const all = await getAdminVideos(ctx);
  const topics = orderTopics(all.map((v) => v.topic));

  const needle = query.toLowerCase();
  const matching = needle
    ? all.filter((v) => [v.title, v.topic, v.level, v.video_id].some((field) => field.toLowerCase().includes(needle)))
    : all;
  const totalPages = Math.max(1, Math.ceil(matching.length / ADMIN_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = matching.slice((current - 1) * ADMIN_PAGE_SIZE, current * ADMIN_PAGE_SIZE);
  const hiddenCount = all.filter((v) => !v.is_published).length;
  const pagination = (
    <AdminPagination basePath="/admin/videos" page={current} totalPages={totalPages} total={matching.length} query={query} />
  );

  return (
    <div className="mt-8 space-y-4">
      <AddVideoForm topics={topics} />
      <p className="text-sm text-muted">
        {all.length} videos in the catalog, {hiddenCount} hidden. Changes show on the home page right away.
      </p>
      <AdminSearchBox action="/admin/videos" query={query} placeholder="Search by title, topic, level or ID" />
      {pagination}

      <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((v) => (
              <tr key={v.video_id} className={v.is_published ? "" : "bg-cream/60"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={getThumbnailUrl(v.video_id)}
                      alt=""
                      width={96}
                      height={54}
                      className="h-[54px] w-24 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <Link href={`/watch/${v.video_id}`} className="font-semibold text-ink hover:text-brand">
                        {v.title}
                      </Link>
                      <p className="text-xs text-muted">
                        {v.channel || "—"} · {v.duration || "—"} · {v.video_id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{v.level}</td>
                <td className="px-4 py-3 text-muted">{v.topic}</td>
                <td className="px-4 py-3">
                  {v.is_published ? (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-dark">Published</span>
                  ) : (
                    <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-muted">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/admin/videos/${v.video_id}`} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-soft">
                      Edit
                    </Link>
                    <AdminActionButton
                      label={v.is_published ? "Hide" : "Publish"}
                      action={setVideoPublished}
                      input={{ videoId: v.video_id, isPublished: !v.is_published }}
                    />
                    <AdminActionButton
                      label="Delete"
                      tone="danger"
                      action={deleteVideo}
                      input={{ videoId: v.video_id }}
                      confirmMessage={`Remove "${v.title}" from the catalog? Its transcript and learners' progress are kept.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-muted">No videos match this search.</p>}
      </div>
      {totalPages > 1 && pagination}
    </div>
  );
}
