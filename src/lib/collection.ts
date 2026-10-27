import { cookies } from "next/headers";
import { isCollectionId, type CollectionId } from "@/data/collections";
import { getUserContext } from "./user-data";

export const COLLECTION_COOKIE = "collection";

// The video collection the learner picked: the cookie on this device first, then their account setting.
// Null means they haven't picked one yet.
export async function getSelectedCollection(): Promise<CollectionId | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COLLECTION_COOKIE)?.value;
  if (isCollectionId(fromCookie)) return fromCookie;

  const ctx = await getUserContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase.from("user_settings").select("collection_id").maybeSingle();
  const stored = (data as { collection_id: string | null } | null)?.collection_id;
  return isCollectionId(stored) ? stored : null;
}
