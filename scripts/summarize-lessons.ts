// Writes a short learner-friendly summary for every stored lesson that has none (public.lessons.summary).
// The daily cron /api/cron/summaries does the same for up to 20 new lessons; this runs them all.
//   npm run summarize:lessons              lessons without a summary
//   npm run summarize:lessons -- --force   rewrite every summary
import { summarizeLessons } from "../src/lib/summarize";

async function main() {
  const result = await summarizeLessons({ isForce: process.argv.includes("--force"), onProgress: console.log });
  if (result.fatalError) {
    console.error(`Stopped: ${result.fatalError}`);
    process.exit(1);
  }
  console.log(`Done: ${result.done} summarised, ${result.failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
