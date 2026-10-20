import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLesson, refetchLesson } from "@/app/admin/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { AdminPagination, AdminSearchBox } from "@/components/admin/AdminListControls";
import { ADMIN_PAGE_SIZE, getAdminVideos, parsePage, parseQuery, requireAdmin } from "@/lib/admin";

export default function AdminLessonsPage({ searchParams }: PageProps<"/admin/lessons">) {
  return (
    <AdminLayout active="/admin/lessons" title="Lessons">
      {searchParams.then((sp) => (
        <LessonTable page={parsePage(sp.page)} query={parseQuery(sp.q)} />
      ))}
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

async function LessonTable({ page, query }: { page: number; query: string }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();

  // Characters that would break PostgREST's or() filter syntax are dropped from the search.
  const safeQuery = query.replace(/[,()%*\\]/g, " ").trim();
  let listQuery = ctx.admin
    .from("lessons")
    .select("video_id, title, author, caption_source, has_translation, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (safeQuery) listQuery = listQuery.or(`title.ilike.%${safeQuery}%,video_id.ilike.%${safeQuery}%,author.ilike.%${safeQuery}%`);

  const [{ data, count, error }, storedIds, catalog] = await Promise.all([
    listQuery,
    ctx.admin.from("lessons").select("video_id"),
    getAdminVideos(ctx),
  ]);
  const catalogIds = new Set(catalog.map((v) => v.video_id));
  if (error) return <p className="mt-8 text-red-600">Couldn&apos;t load lessons: {error.message}</p>;

  const lessons = (data ?? []) as LessonRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const stored = new Set(((storedIds.data ?? []) as { video_id: string }[]).map((l) => l.video_id));
  const missing = catalog.filter((v) => !stored.has(v.video_id));
  const pagination = (
    <AdminPagination basePath="/admin/lessons" page={page} totalPages={totalPages} total={total} query={query} />
  );

  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm text-muted">
        {stored.size} stored transcripts. Catalog videos missing a transcript: {missing.length}. “Refetch” asks YouTube
        again and only works from a connection YouTube doesn&apos;t block (usually not the deployed server).
      </p>

      {missing.length > 0 && (
        <section className="rounded-3xl border border-accent/30 bg-accent-soft p-5">
          <h2 className="font-bold text-ink">Missing transcripts</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {missing.map((v) => (
              <li key={v.video_id} className="flex items-center justify-between gap-3">
                <span>{v.title}</span>
                <AdminActionButton label="Fetch" action={refetchLesson} input={{ videoId: v.video_id }} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdminSearchBox action="/admin/lessons" query={query} placeholder="Search by title, channel or video ID" />
      {pagination}

      <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
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
                    {!catalogIds.has(l.video_id) && " · pasted link"}
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
        {lessons.length === 0 && <p className="p-6 text-muted">No lessons match this search.</p>}
      </div>
      {totalPages > 1 && pagination}
    </div>
  );
}
