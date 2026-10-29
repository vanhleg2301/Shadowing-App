import { cookies } from "next/headers";
import { getUserContext } from "./user-data";

export const COURSE_MODE_COOKIE = "course-mode";
export type CourseMode = "full" | "gentle";

export function isCourseMode(value: unknown): value is CourseMode {
  return value === "full" || value === "gentle";
}

// The plan the learner picked for the A2 course: this device's cookie first, then their account
// (migration 017); the full plan until they choose.
export async function getCourseMode(): Promise<CourseMode> {
  const value = (await cookies()).get(COURSE_MODE_COOKIE)?.value;
  if (isCourseMode(value)) return value;

  const ctx = await getUserContext();
  if (!ctx) return "full";
  const { data } = await ctx.supabase.from("user_settings").select("course_mode").maybeSingle();
  const stored = (data as { course_mode: string | null } | null)?.course_mode;
  return isCourseMode(stored) ? stored : "full";
}
