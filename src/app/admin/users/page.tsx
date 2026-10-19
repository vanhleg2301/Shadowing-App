import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteUser, setUserBanned } from "@/app/admin/actions";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminLayout, formatDate } from "@/components/admin/AdminLayout";
import { listUsers, requireAdmin } from "@/lib/admin";

export default function AdminUsersPage() {
  return (
    <AdminLayout active="/admin/users" title="Users">
      <UserTable />
    </AdminLayout>
  );
}

async function UserTable() {
  const ctx = await requireAdmin();
  if (!ctx) notFound();
  const users = await listUsers(ctx);

  return (
    <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-white">
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
      {users.length === 0 && <p className="p-6 text-muted">No users yet.</p>}
    </div>
  );
}
