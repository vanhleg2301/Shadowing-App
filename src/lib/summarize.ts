// Writes a short learner-friendly summary for stored lessons (public.lessons.summary) with Claude, once per
// video, so learners never trigger a paid call. Used by scripts/summarize-lessons.ts and the cron route
// /api/cron/summaries. Kept free of Next.js imports so the script can use it.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { LessonSummary, Sentence } from "./lesson";
import { createAdminClient } from "./supabase/admin";

const MODEL_ID = process.env.MODEL_ID ?? "claude-opus-5-5";
const MAX_TRANSCRIPT_CHARS = 30000;

const SYSTEM_PROMPT = `You summarise English-learning videos for learners at CEFR level A2 to B1.

Rules:
- Use only common A2–B1 words and short sentences (under 15 words).
- Write in English.
- Base everything on the transcript; never add facts that aren't in it.

Fields:
- overview: 2–3 sentences saying what the video is about and who is speaking.
- keyPoints: 3–5 main points, one short sentence each, in the order they come up.
- keyWords: 6–8 useful words or phrases exactly as they appear in the transcript, each with a simple meaning.`;

const SummarySchema = z.object({
  overview: z.string(),
  keyPoints: z.array(z.string()),
  keyWords: z.array(z.object({ word: z.string(), meaning: z.string() })),
});

export interface SummarizeOptions {
  // Rewrite lessons that already have a summary.
  isForce?: boolean;
  // At most this many lessons in one run.
  limit?: number;
  onProgress?: (message: string) => void;
}

export interface SummarizeResult {
  done: number;
  failed: number;
  remaining: number;
  // Set when a call failed in a way every later call would too (no credits, bad key).
  fatalError?: string;
}

export async function summarizeLessons({ isForce = false, limit, onProgress = () => {} }: SummarizeOptions = {}): Promise<SummarizeResult> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing Supabase settings or SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");

  let query = admin.from("lessons").select("video_id, title, sentences", { count: "exact" });
  if (!isForce) query = query.is("summary", null);
  if (limit) query = query.limit(limit);
  const { data, count, error } = await query;
  if (error) throw new Error(`Can't read lessons: ${error.message}`);
  const lessons = (data ?? []) as { video_id: string; title: string; sentences: Sentence[] }[];
  onProgress(`${lessons.length} of ${count ?? lessons.length} lessons to summarise in this run`);

  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {});
  let done = 0;
  let failed = 0;
  for (const lesson of lessons) {
    const transcript = lesson.sentences
      .map((s) => s.text)
      .join(" ")
      .slice(0, MAX_TRANSCRIPT_CHARS);
    try {
      const response = await client.beta.messages.parse({
        model: MODEL_ID,
        max_tokens: 4000,
        output_config: { effort: "low", format: betaZodOutputFormat(SummarySchema) },
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Title: ${lesson.title}\n\n<transcript>\n${transcript}\n</transcript>` }],
      });
      const parsed = response.parsed_output;
      if (!parsed) throw new Error("No summary in the response");
      const summary: LessonSummary = { ...parsed, source: "ai" };
      const { error: saveError } = await admin.from("lessons").update({ summary }).eq("video_id", lesson.video_id);
      if (saveError) throw new Error(saveError.message);
      onProgress(`[${++done}/${lessons.length}] ${lesson.title}`);
    } catch (err) {
      failed++;
      const detail = err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : String(err);
      onProgress(`${lesson.video_id} ${lesson.title}: ${detail}`);
      if (err instanceof Anthropic.APIError && (err.status === 400 || err.status === 401 || err.status === 403)) {
        return { done, failed, remaining: (count ?? lessons.length) - done, fatalError: detail };
      }
    }
  }
  return { done, failed, remaining: (count ?? lessons.length) - done };
}
