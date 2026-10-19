import type { NextRequest } from "next/server";
import { normalizeWord } from "@/lib/dictionary";
import { lookupWord } from "@/lib/lookup";

const MAX_SENTENCE_LENGTH = 400;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const word = normalizeWord(params.get("word") ?? "");
  const sentence = (params.get("sentence") ?? "").slice(0, MAX_SENTENCE_LENGTH);
  if (!word) return Response.json({ error: "Missing word" }, { status: 400 });

  try {
    return Response.json(await lookupWord(word, sentence));
  } catch {
    return Response.json({ error: "Word not found" }, { status: 404 });
  }
}
