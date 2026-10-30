import { recordServerError } from "@/lib/error-log";
import { summarizeLessons } from "@/lib/summarize";

// Each run summarises at most this many new lessons, so cost and run time stay small and predictable.
const LESSONS_PER_RUN = 20;

// Up to 20 Claude calls in one run.
export const maxDuration = 300;

// Writes summaries for lessons added since the last run (seed, VOA import). Does nothing, and costs nothing,
// when every lesson already has one. Not scheduled while there are no API credits: add it back to the crons
// in vercel.json ("0 20 * * *") to run it daily.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await summarizeLessons({ limit: LESSONS_PER_RUN });
    if (result.fatalError || result.failed > 0) {
      await recordServerError({
        error: new Error(`Summaries: ${result.failed} failed${result.fatalError ? `, stopped: ${result.fatalError}` : ""}`),
        path: "/api/cron/summaries",
        method: "GET",
        routeType: "route",
        routePath: "/api/cron/summaries",
      });
    }
    return Response.json(result);
  } catch (err) {
    await recordServerError({ error: err, path: "/api/cron/summaries", method: "GET", routeType: "route", routePath: "/api/cron/summaries" });
    return Response.json({ error: err instanceof Error ? err.message : "failed" }, { status: 500 });
  }
}
