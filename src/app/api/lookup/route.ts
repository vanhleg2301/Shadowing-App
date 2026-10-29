import type { NextRequest } from "next/server";
import { normalizeWord } from "@/lib/dictionary";
import { lookupWord } from "@/lib/lookup";
import { LOOKUP_PER_DAY, LOOKUP_PER_MINUTE, checkRateLimits, getRateLimitSubject } from "@/lib/rate-limit";
import { getUserContext } from "@/lib/user-data";

const MAX_SENTENCE_LENGTH = 400;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const word = normalizeWord(params.get("word") ?? "");
  const sentence = (params.get("sentence") ?? "").slice(0, MAX_SENTENCE_LENGTH);
  if (!word) return Response.json({ error: "Missing word" }, { status: 400 });

  const ctx = await getUserContext().catch(() => null);
  const subject = await getRateLimitSubject(ctx?.user.id ?? null);
  if (!(await checkRateLimits(subject, [LOOKUP_PER_MINUTE, LOOKUP_PER_DAY]))) {
    return Response.json({ error: "Too many lookups. Please wait a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  }

  try {
    return Response.json(await lookupWord(word, sentence));
  } catch {
    return Response.json({ error: "Word not found" }, { status: 404 });
  }
}
