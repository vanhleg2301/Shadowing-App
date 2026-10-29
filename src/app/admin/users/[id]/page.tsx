import Link from "next/link";
import { notFound } from "next/navigation";
import { SignInList, type SignInEventRow } from "@/components/admin/SignInList";
import { deleteUserFavorite, deleteUserWord, resetUserProgress } from "@/app/admin/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { getAdminVideos, requireAdmin, summarizeUser } from "@/lib/admin";

export default function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  return (
    <AdminLayout active="/admin/users" title="User details">
      {params.then(({ id }) => (
        <UserDetails id={id} />
      ))}
    </AdminLayout>
  );
}

interface WordRow {
  word: string;
  sentence: string;
  reps: number;
  due_at: string;
}

interface FavoriteRow {
  video_id: string;
  title: string;
}

interface ProgressRow {
  video_id: string;
  max_sentence: number;
  sentence_count: number;
  completed_at: string | null;
  updated_at: string;
}

async function UserDetails({ id }: { id: string }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const { data, error } = await ctx.admin.auth.admin.getUserById(id);
  if (error || !data.user) notFound();

  const [words, favorites, progress, days, signIns] = await Promise.all([
    ctx.admin.from("saved_words").select("word, sentence, reps, due_at").eq("user_id", id).order("created_at", { ascending: false }),
    ctx.admin.from("favorites").select("video_id, title").eq("user_id", id).order("created_at", { ascending: false }),
    ctx.admin
      .from("lesson_progress")
      .select("video_id, max_sentence, sentence_count, completed_at, updated_at")
      .eq("user_id", id)
      .order("updated_at", { ascending: false }),
    ctx.admin.from("study_days").select("day", { count: "exact", head: true }).eq("user_id", id),
    ctx.admin
      .from("sign_in_events")
      .select("id, user_id, email, event, device, country, detail, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const wordRows = (words.data ?? []) as WordRow[];
  const favoriteRows = (favorites.data ?? []) as FavoriteRow[];
  const progressRows = (progress.data ?? []) as ProgressRow[];
  const user = summarizeUser(data.user, {
    savedWords: wordRows.length,
    favorites: favoriteRows.length,
    lessonsStarted: progressRows.length,
  });
  const catalog = await getAdminVideos(ctx);
  const titleOf = (videoId: string) => catalog.find((v) => v.video_id === videoId)?.title ?? videoId;

  return (
    <div className="mt-8 space-y-6">

      <section className="rounded-3xl border border-line bg-surface p-5">
        <p className="text-xl font-extrabold text-ink">{user.name || user.email}</p>
        <p className="text-sm text-muted">
          {user.email} · {user.provider} · joined {formatDate(user.createdAt)} · last sign-in {formatDate(user.lastSignInAt)}
        </p>
        <p className="mt-2 text-sm text-ink">
          {wordRows.length} saved words · {favoriteRows.length} favorites · {progressRows.length} lessons started ·{" "}
          {days.count ?? 0} study days
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">Recent sign-ins</h2>
        <SignInList rows={(signIns.data ?? []) as SignInEventRow[]} showEmail={false} />
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Lesson progress</h2>
          {progressRows.length > 0 && (
            <AdminActionButton
              label="Reset progress & streak"
              tone="danger"
              action={resetUserProgress}
              input={{ userId: id }}
              confirmMessage="Reset all lesson progress and the study streak for this user?"
            />
          )}
        </div>
        <ul className="mt-3 divide-y divide-line text-sm">
          {progressRows.map((p) => (
            <li key={p.video_id} className="flex justify-between gap-3 py-2">
              <span className="text-ink">{titleOf(p.video_id)}</span>
              <span className="shrink-0 text-muted">
                {p.completed_at ? "Completed" : `${p.max_sentence + 1}/${p.sentence_count}`} · {formatDate(p.updated_at)}
              </span>
            </li>
          ))}
          {progressRows.length === 0 && <li className="py-2 text-muted">No lessons started.</li>}
        </ul>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold text-ink">Saved words</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {wordRows.map((w) => (
            <li key={w.word} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{w.word}</p>
                <p className="truncate text-xs text-muted">{w.sentence}</p>
              </div>
              <AdminActionButton label="Remove" tone="danger" action={deleteUserWord} input={{ userId: id, word: w.word }} />
            </li>
          ))}
          {wordRows.length === 0 && <li className="py-2 text-muted">No saved words.</li>}
        </ul>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold text-ink">Favorites</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {favoriteRows.map((f) => (
            <li key={f.video_id} className="flex items-center justify-between gap-3 py-2">
              <Link href={`/watch/${f.video_id}`} className="text-ink hover:text-brand">
                {f.title}
              </Link>
              <AdminActionButton
                label="Remove"
                tone="danger"
                action={deleteUserFavorite}
                input={{ userId: id, videoId: f.video_id }}
              />
            </li>
          ))}
          {favoriteRows.length === 0 && <li className="py-2 text-muted">No favorites.</li>}
        </ul>
      </section>
    </div>
  );
}
