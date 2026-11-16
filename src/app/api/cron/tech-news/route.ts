import { recordServerError } from "@/lib/error-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { importTechArticles } from "@/lib/tech-news-import";

export const maxDuration = 60;

// Runs once a day (vercel.json): adds one new AI article from The Conversation to News > AI & Tech.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  if (!admin) return Response.json({ error: "not-configured" }, { status: 500 });
  try {
    return Response.json(await importTechArticles(admin));
  } catch (err) {
    await recordServerError({ error: err, path: "/api/cron/tech-news", method: "GET", routeType: "route", routePath: "/api/cron/tech-news" });
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
