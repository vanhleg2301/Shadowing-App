import { NextResponse, type NextRequest } from "next/server";
import { recordSignInEvent } from "@/lib/sign-in-log";
import { createClient } from "@/lib/supabase/server";

// Google redirects here after sign-in; trade the one-time code for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await createClient();
  if (code && supabase) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await recordSignInEvent({ event: "sign_in", userId: data.user?.id, email: data.user?.email, headers: request.headers });
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    await recordSignInEvent({ event: "sign_in_failed", headers: request.headers, detail: error.message });
  } else {
    // Google sends an error back instead of a code, e.g. when the learner cancels.
    const reason = searchParams.get("error_description") ?? searchParams.get("error") ?? "No sign-in code";
    await recordSignInEvent({ event: "sign_in_failed", headers: request.headers, detail: reason });
  }
  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
