import { cookies } from "next/headers";

export const COURSE_MODE_COOKIE = "course-mode";
export type CourseMode = "full" | "gentle";

export function isCourseMode(value: unknown): value is CourseMode {
  return value === "full" || value === "gentle";
}

// The plan the learner picked for the A2 course on this device; the full plan until they choose.
export async function getCourseMode(): Promise<CourseMode> {
  const value = (await cookies()).get(COURSE_MODE_COOKIE)?.value;
  return isCourseMode(value) ? value : "full";
}
