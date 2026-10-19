import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLesson, refetchLesson } from "@/app/admin/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { CURATED_VIDEOS } from "@/data/curated";
import { requireAdmin } from "@/lib/admin";

export default function AdminLessonsPage() {
  return (
    <AdminLayout active="/admin/lessons" title="Lessons">
      <LessonTable />
    </AdminLayout>
  );
}

interface LessonRow {
  video_id: string;
  title: string;
  author: string;
  caption_source: "human" | "asr";
  has_translation: boolean;
  updated_at: string;
}

async function LessonTable() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { data, error } = await ctx.admin
    .from("lessons")
    .select("video_id, title, author, caption_source, has_translation, updated_at")
    .order("updated_at", { ascending: false });
  if (error) return <p className="mt-8 text-red-600">Couldn&apos;t load lessons: {error.message}</p>;

  const lessons = (data ?? []) as LessonRow[];
  const stored = new Set(lessons.map((l) => l.video_id));
  const missing = CURATED_VIDEOS.filter((v) => !stored.has(v.videoId));

  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm text-muted">
        {lessons.length} stored transcripts. Curated videos missing a transcript: {missing.length}. “Refetch” asks YouTube
        again and only works from a connection YouTube doesn&apos;t block (usually not the deployed server).
      </p>

      {missing.length > 0 && (
        <section className="rounded-3xl border border-orange-200 bg-orange-50 p-5">
          <h2 className="font-bold text-ink">Missing transcripts</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {missing.map((v) => (
              <li key={v.videoId} className="flex items-center justify-between gap-3">
                <span>{v.title}</span>
                <AdminActionButton label="Fetch" action={refetchLesson} input={{ videoId: v.videoId }} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Captions</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {lessons.map((l) => (
              <tr key={l.video_id}>
                <td className="px-4 py-3">
                  <Link href={`/watch/${l.video_id}`} className="font-semibold text-ink hover:text-brand">
                    {l.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {l.author} · {l.video_id}
                    {!CURATED_VIDEOS.some((v) => v.videoId === l.video_id) && " · pasted link"}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {l.caption_source === "human" ? "Human" : "Auto"}
                  {l.has_translation && " + VI"}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(l.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <AdminActionButton label="Refetch" action={refetchLesson} input={{ videoId: l.video_id }} />
                    <AdminActionButton
                      label="Delete"
                      tone="danger"
                      action={deleteLesson}
                      input={{ videoId: l.video_id }}
                      confirmMessage={`Delete the stored transcript for "${l.title}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
