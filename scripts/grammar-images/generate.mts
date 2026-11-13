// Draws the grammar units' pictures with FLUX.1 [schnell] (Apache 2.0) on Cloudflare Workers AI, whose free
// allowance (10,000 neurons a day, about 170 pictures) covers them, and saves them to public/grammar/.
// Pictures already there are skipped, so a run stopped by the daily limit carries on the next day; delete a
// picture to draw it again. Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Workers AI) in .env.local.
//   npx tsx scripts/grammar-images/generate.mts [unit-slug ...]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { GRAMMAR_CAST, GRAMMAR_UNITS, getStoryPicture, getWordPicture } from "../../src/data/grammar";

const STYLE =
  "Flat vector illustration in a warm children's picture-book style, soft pastel colours, simple clean shapes, " +
  "gentle shading, plain light background, no text, no letters, no words, no captions. ";
const SIZE = 640;

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z_]+)=(.*)$/))
    .filter((m) => m !== null)
    .map((m) => [m[1], m[2].trim().replace(/^"|"$/g, "")]),
);
const account = env.CLOUDFLARE_ACCOUNT_ID;
const token = env.CLOUDFLARE_API_TOKEN;
if (!account || !token) throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be in .env.local");

const describe = (picture: string) => picture.replace(/\{(\w+)\}/g, (_, name: string) => GRAMMAR_CAST[name] ?? name);

async function draw(picture: string): Promise<Buffer> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: STYLE + describe(picture), steps: 4 }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`);
  const { result } = (await res.json()) as { result: { image: string } };
  return sharp(Buffer.from(result.image, "base64")).resize(SIZE, SIZE).webp({ quality: 78 }).toBuffer();
}

const only = process.argv.slice(2);
const jobs = GRAMMAR_UNITS.filter((unit) => only.length === 0 || only.includes(unit.slug)).flatMap((unit) => [
  ...unit.story.lines.map((line, i) => ({ path: getStoryPicture(unit, i), picture: line.picture })),
  ...unit.words.map((word) => ({ path: getWordPicture(unit, word), picture: word.picture })),
]);
const todo = jobs.filter((job) => !existsSync(join("public", job.path)));
console.log(`${todo.length} of ${jobs.length} pictures to draw`);

let done = 0;
for (const job of todo) {
  const file = join("public", job.path);
  try {
    const image = await draw(job.picture);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, image);
    done++;
    console.log(`[${done}/${todo.length}] ${job.path} ${Math.round(image.length / 1024)} KB`);
  } catch (error) {
    console.log(`${job.path}: ${(error as Error).message}`);
    // The daily allowance is used up: stop, and run again tomorrow.
    if (/4006|429|neurons|quota|limit/i.test((error as Error).message)) break;
  }
}
console.log(`Drew ${done} pictures, ${todo.length - done} left.`);
