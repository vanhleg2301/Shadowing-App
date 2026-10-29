import { headers } from "next/headers";
import { createAdminClient } from "./supabase/admin";

export interface RateLimit {
  name: string;
  limit: number;
  windowSeconds: number;
}

// Word lookups can call Claude, so they are capped per minute and per day.
export const LOOKUP_PER_MINUTE: RateLimit = { name: "lookup-min", limit: 40, windowSeconds: 60 };
export const LOOKUP_PER_DAY: RateLimit = { name: "lookup-day", limit: 600, windowSeconds: 86400 };
// Saving words, notes, favorites and grades: generous for a real learner, a wall for scripts.
export const WRITES_PER_MINUTE: RateLimit = { name: "write-min", limit: 120, windowSeconds: 60 };

// The signed-in user, otherwise the visitor's IP (Vercel sets x-forwarded-for).
export async function getRateLimitSubject(userId: string | null): Promise<string> {
  if (userId) return `user:${userId}`;
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return `ip:${ip.slice(0, 64)}`;
}

// True when every limit still has room (each one counts this hit). Fails open: if the database can't be
// reached or migration 022 hasn't run, requests are allowed rather than blocking learners.
export async function checkRateLimits(subject: string, limits: RateLimit[]): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return true;
  const results = await Promise.all(
    limits.map(async ({ name, limit, windowSeconds }) => {
      const { data, error } = await admin.rpc("hit_rate_limit", {
        p_key: `${name}:${subject}`,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      return error ? true : data !== false;
    }),
  );
  return results.every(Boolean);
}
