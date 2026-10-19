"use server";

import { isAdminEmail } from "@/lib/admin-emails";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/user-data";

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

// Required by the App Store and Google Play: users must be able to delete their account in the app.
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
  const ctx = await getUserContext();
  if (!ctx) return { ok: false, error: "You're not signed in." };
  if (isAdminEmail(ctx.user.email)) return { ok: false, error: "Admin accounts can't be deleted here." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Account deletion isn't available right now." };

  // Favorites, saved words, progress and study days are removed by ON DELETE CASCADE.
  const { error } = await admin.auth.admin.deleteUser(ctx.user.id);
  if (error) return { ok: false, error: "Couldn't delete your account. Please try again." };
  await ctx.supabase.auth.signOut();
  return { ok: true };
}
