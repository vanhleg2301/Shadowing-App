import { cookies } from "next/headers";

export const TIME_ZONE_COOKIE = "tz";
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

// The learner's local calendar day (YYYY-MM-DD), from the time zone their browser stored in a cookie.
export async function getLocalToday(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TIME_ZONE_COOKIE)?.value;
  try {
    const timeZone = raw ? decodeURIComponent(raw) : DEFAULT_TIME_ZONE;
    return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TIME_ZONE }).format(new Date());
  }
}

export function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
