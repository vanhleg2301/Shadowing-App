// Writes a short learner-friendly summary for every stored lesson that has none (public.lessons.summary).
// Uses Claude once per video, so learners never trigger a paid call.
//   npm run summarize:lessons              lessons without a summary
//   npm run summarize:lessons -- --force   rewrite every summary
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { LessonSummary, Sentence } from "../src/lib/lesson";
import { createAdminClient } from "../src/lib/supabase/admin";

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

async function main() {
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing Supabase settings or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY in .env.local");

  const isForce = process.argv.includes("--force");
  let query = admin.from("lessons").select("video_id, title, sentences");
  if (!isForce) query = query.is("summary", null);
  const { data, error } = await query;
  if (error) throw new Error(`Can't read lessons: ${error.message}`);
  const lessons = (data ?? []) as { video_id: string; title: string; sentences: Sentence[] }[];
  console.log(`${lessons.length} lessons to summarise`);

  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {});
  let done = 0;
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
      console.log(`[${++done}/${lessons.length}] ${lesson.title}`);
    } catch (err) {
      const detail = err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : String(err);
      console.error(`${lesson.video_id} ${lesson.title}: ${detail}`);
      // No credits or a bad key: every later call would fail the same way.
      if (err instanceof Anthropic.APIError && (err.status === 400 || err.status === 401 || err.status === 403)) process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
