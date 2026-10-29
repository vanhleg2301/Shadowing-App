import { createAdminClient } from "./supabase/admin";

export type SignInEvent = "sign_in" | "sign_in_failed" | "sign_out";

interface SignInRecord {
  event: SignInEvent;
  userId?: string | null;
  email?: string | null;
  headers: Headers;
  detail?: string;
}

// "Chrome · Android" from a user agent: enough to recognise a device, without storing the full string.
export function describeDevice(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const browser =
    /Edg\//.test(userAgent) ? "Edge"
    : /OPR\/|Opera/.test(userAgent) ? "Opera"
    : /SamsungBrowser/.test(userAgent) ? "Samsung Internet"
    : /CriOS|Chrome\//.test(userAgent) ? "Chrome"
    : /FxiOS|Firefox\//.test(userAgent) ? "Firefox"
    : /Safari\//.test(userAgent) ? "Safari"
    : "Other browser";
  const os =
    /iPhone|iPad|iPod/.test(userAgent) ? "iOS"
    : /Android/.test(userAgent) ? "Android"
    : /Windows/.test(userAgent) ? "Windows"
    : /Mac OS X|Macintosh/.test(userAgent) ? "macOS"
    : /Linux/.test(userAgent) ? "Linux"
    : "Other OS";
  return `${browser} · ${os}`;
}

// Records a sign-in event for Admin -> Sign-ins. Never throws: a logging failure must not block signing in.
export async function recordSignInEvent({ event, userId = null, email = null, headers, detail }: SignInRecord) {
  const admin = createAdminClient();
  if (!admin) return;
  try {
    await admin.from("sign_in_events").insert({
      user_id: userId,
      email,
      event,
      device: describeDevice(headers.get("user-agent")),
      // Set by Vercel from the request; no IP address is stored.
      country: headers.get("x-vercel-ip-country"),
      detail: detail?.slice(0, 200) ?? null,
    });
  } catch {
    // Ignored on purpose, see above.
  }
}
