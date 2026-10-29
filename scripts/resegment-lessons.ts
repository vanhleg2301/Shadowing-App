// Re-cuts the sentences of stored YouTube lessons with src/lib/segment.ts, from the data already in the
// database (no YouTube calls). Auto captions keep their per-word times; human captions get times spread
// over each old sentence. VOA lessons (aligned audio) and lessons with translations are left alone.
//   npm run resegment:lessons                     dry run: counts and before/after samples
//   npm run resegment:lessons -- --only=ID,ID     dry run for some videos, printing every change
//   npm run resegment:lessons -- --write          save the new sentences
import type { Sentence } from "../src/lib/lesson";
import { CUE_TIMED_LIMITS, WORD_TIMED_LIMITS, endsSentence, segmentWords, type TimedWord } from "../src/lib/segment";
import { createAdminClient } from "../src/lib/supabase/admin";

interface LessonRow {
  video_id: string;
  title: string;
  caption_source: string;
  has_translation: boolean;
  sentences: Sentence[];
}

const PAGE = 200;

function toWords(row: LessonRow): TimedWord[] {
  const isAsr = row.caption_source === "asr";
  return row.sentences.flatMap((sentence, i) => {
    const tokens = sentence.text.split(/\s+/).filter(Boolean);
    const times =
      sentence.wordStarts && sentence.wordStarts.length === tokens.length
        ? sentence.wordStarts
        : tokens.map((_, k) => sentence.start + (k * Math.max(sentence.end - sentence.start, 0)) / tokens.length);
    // Auto-caption fragments were capitalised as if they started a sentence; undo that mid-sentence.
    const previous = row.sentences[i - 1];
    if (isAsr && previous && !endsSentence(previous.text) && tokens[0] && !/^I($|')/.test(tokens[0])) {
      tokens[0] = tokens[0].charAt(0).toLowerCase() + tokens[0].slice(1);
    }
    // Old sentence starts are real caption times, the safest places to cut.
    return tokens.map((text, k) => ({ start: Math.round(times[k] * 100) / 100, text, isCueStart: k === 0, isCueEnd: k === tokens.length - 1 }));
  });
}

function resegment(row: LessonRow): Sentence[] {
  const isAsr = row.caption_source === "asr";
  const words = toWords(row);
  const hasPunctuation = words.some((w) => endsSentence(w.text));
  const chunks = segmentWords(words, isAsr ? WORD_TIMED_LIMITS : CUE_TIMED_LIMITS);
  const lastEnd = row.sentences[row.sentences.length - 1]?.end ?? 0;
  const hasRealTimes = isAsr && row.sentences.every((s) => s.wordStarts && s.wordStarts.length === s.text.split(/\s+/).filter(Boolean).length);
  return chunks.map((chunk, i) => {
    let text = chunk.map((w) => w.text).join(" ");
    const startsSentence = i === 0 || !hasPunctuation || endsSentence(chunks[i - 1][chunks[i - 1].length - 1].text);
    if (isAsr && startsSentence) text = text.charAt(0).toUpperCase() + text.slice(1);
    return {
      start: chunk[0].start,
      end: chunks[i + 1]?.[0].start ?? Math.max(lastEnd, chunk[chunk.length - 1].start + 0.5),
      text,
      ...(hasRealTimes ? { wordStarts: chunk.map((w) => w.start) } : {}),
    };
  });
}

function midSentenceCuts(sentences: Sentence[]): number {
  return sentences.slice(0, -1).filter((s) => !endsSentence(s.text)).length;
}

async function main() {
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing Supabase settings or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  const isWrite = process.argv.includes("--write");
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

  const rows: LessonRow[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = admin.from("lessons").select("video_id, title, caption_source, has_translation, sentences").neq("caption_source", "aligned");
    if (only) query = query.in("video_id", only);
    const { data, error } = await query.order("video_id").range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as LessonRow[]));
    if (!data || data.length < PAGE) break;
  }

  const totals: Record<string, { lessons: number; before: number; after: number; cutsBefore: number; cutsAfter: number }> = {};
  let skipped = 0;
  let saved = 0;
  for (const row of rows) {
    if (row.has_translation) {
      skipped++;
      continue;
    }
    const next = resegment(row);
    const total = (totals[row.caption_source] ??= { lessons: 0, before: 0, after: 0, cutsBefore: 0, cutsAfter: 0 });
    total.lessons++;
    total.before += row.sentences.length;
    total.after += next.length;
    const hasPunctuation = row.sentences.some((s) => /[.?!]/.test(s.text));
    if (hasPunctuation) {
      total.cutsBefore += midSentenceCuts(row.sentences);
      total.cutsAfter += midSentenceCuts(next);
    }
    if (only) {
      console.log(`\n=== ${row.video_id} ${row.title} (${row.caption_source})`);
      console.log("--- before");
      row.sentences.slice(0, 12).forEach((s) => console.log(`  ${s.start.toFixed(1)}-${s.end.toFixed(1)}  ${s.text}`));
      console.log("--- after");
      next.slice(0, 12).forEach((s) => console.log(`  ${s.start.toFixed(1)}-${s.end.toFixed(1)}  ${s.text}`));
    }
    if (isWrite) {
      const { error } = await admin.from("lessons").update({ sentences: next, updated_at: new Date().toISOString() }).eq("video_id", row.video_id);
      if (error) console.error(`${row.video_id}: ${error.message}`);
      else saved++;
    }
  }

  console.log("\nPer caption source (mid-sentence cuts counted only in lessons with punctuation):");
  console.table(totals);
  console.log(`Skipped ${skipped} lessons with translations.`);
  if (isWrite) console.log(`Saved ${saved} lessons.`);
  else console.log("Dry run: nothing saved. Add --write to save.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
