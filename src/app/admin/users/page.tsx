import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUser, setUserBanned } from "@/app/admin/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { AdminPagination, AdminSearchBox } from "@/components/admin/AdminListControls";
import { listUsers, parsePage, parseQuery, requireAdmin } from "@/lib/admin";

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <AdminLayout active="/admin/users" title="Users">
      {searchParams.then((sp) => (
        <UserTable page={parsePage(sp.page)} query={parseQuery(sp.q)} />
      ))}
    </AdminLayout>
  );
}

async function UserTable({ page, query }: { page: number; query: string }) {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const result = await listUsers(ctx, page, query);
  const users = result.items;
  const pagination = (
    <AdminPagination basePath="/admin/users" page={result.page} totalPages={result.totalPages} total={result.total} query={query} />
  );

  return (
    <div className="mt-8 space-y-4">
      <AdminSearchBox action="/admin/users" query={query} placeholder="Search by email or name" />
      {pagination}
      <div className="overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Words</th>
              <th className="px-4 py-3 text-right">Favs</th>
              <th className="px-4 py-3 text-right">Lessons</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className={u.isBanned ? "bg-red-50/50" : ""}>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="font-semibold text-ink hover:text-brand">
                    {u.name || u.email}
                  </Link>
                  <p className="text-xs text-muted">
                    {u.email} · {u.provider}
                    {u.isAdmin && <span className="ml-1 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">ADMIN</span>}
                    {u.isBanned && <span className="ml-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">BANNED</span>}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(u.lastSignInAt)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">{u.savedWords}</td>
                <td className="px-4 py-3 text-right">{u.favorites}</td>
                <td className="px-4 py-3 text-right">{u.lessonsStarted}</td>
                <td className="px-4 py-3">
                  {u.isAdmin ? (
                    <span className="text-xs text-muted">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <AdminActionButton
                        label={u.isBanned ? "Unban" : "Ban"}
                        action={setUserBanned}
                        input={{ userId: u.id, isBanned: !u.isBanned }}
                        confirmMessage={u.isBanned ? undefined : `Ban ${u.email}? They won't be able to sign in.`}
                      />
                      <AdminActionButton
                        label="Delete"
                        tone="danger"
                        action={deleteUser}
                        input={{ userId: u.id }}
                        confirmMessage={`Delete ${u.email} and all their data? This can't be undone.`}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-muted">{query ? "No users match this search." : "No users yet."}</p>}
      </div>
      {result.totalPages > 1 && pagination}
    </div>
  );
}
