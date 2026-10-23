import { cookies } from "next/headers";

export const TIME_ZONE_COOKIE = "tz";
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

// The learner's time zone, as their browser stored it in a cookie.
export async function getTimeZone(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TIME_ZONE_COOKIE)?.value;
  const timeZone = raw ? decodeURIComponent(raw) : DEFAULT_TIME_ZONE;
  return isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
}

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone });
    return true;
  } catch {
    return false;
  }
}

// The calendar day (YYYY-MM-DD) in a time zone.
export function getDayIn(timeZone: string, date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE }).format(date);
}

// The learner's local calendar day (YYYY-MM-DD).
export async function getLocalToday(): Promise<string> {
  return getDayIn(await getTimeZone());
}

export function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
