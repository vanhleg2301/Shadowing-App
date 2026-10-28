"""Imports VOA Learning English lessons (public domain) as hosted-audio lessons.

For each article: downloads the audio (or the video's soundtrack), re-encodes it to a small mono MP3,
times VOA's own transcript against it with Whisper word timestamps, then uploads the MP3 and cover image
to Supabase Storage (bucket lesson-media, migration 010) and upserts the lessons and videos rows.

Runs in GitHub Actions (.github/workflows/import-voa.yml) because some networks block VOA.
Settings come from environment variables:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   required unless DRY_RUN
  PROGRAMS   comma-separated keys of PROGRAMS below (default: all)
  URLS       optional space-separated article or section URLs, used instead of PROGRAMS
  LIMIT      new lessons per run (default 20)
  DRY_RUN    "true" to parse and align without writing anything
"""

from __future__ import annotations

import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

SITE = "https://learningenglish.voanews.com"
USER_AGENT = "Mozilla/5.0 (compatible; ShadowingAppImporter/1.0; +https://shadowing-app-liard.vercel.app)"
BUCKET = "lesson-media"
CHANNEL = "VOA Learning English"
COLLECTION = "voa"
WHISPER_MODEL = "small.en"
PAGE_PAUSE_S = 1.0
MAX_SECTION_PAGES = 15

# A lesson is kept only if Whisper heard most of the transcript; sentences with too few heard words are
# dropped (exercises and notes on the page that aren't in the audio).
MIN_AUDIO_COVERAGE = 0.5
MIN_SENTENCE_MATCH = 0.5
MIN_SENTENCES = 8
MAX_SENTENCE_SEC = 15.0
START_PAD_S = 0.12
END_PAD_S = 0.25


@dataclass
class Program:
    names: list[str]
    level: str
    topic: str


PROGRAMS: dict[str, Program] = {
    # Programs whose pages carry a transcript next to the audio (the podcast and English in a Minute don't).
    "lets-learn-english-1": Program(["Let's Learn English - Level 1", "Let's Learn English Level 1"], "A1", "Everyday Words"),
    "lets-learn-english-2": Program(["Let's Learn English - Level 2", "Let's Learn English Level 2"], "A2", "Everyday Words"),
    "everyday-grammar": Program(["Everyday Grammar"], "B1", "Everyday Words"),
    "health-lifestyle": Program(["Health & Lifestyle", "Health and Lifestyle"], "B1", "Health"),
    "words-and-their-stories": Program(["Words & Their Stories", "Words and Their Stories"], "B1", "Everyday Words"),
}

TOPIC_KEYWORDS: list[tuple[str, str]] = [
    ("Food & Drink", r"food|eat|eating|restaurant|cook|cooking|coffee|tea|drink|dinner|lunch|breakfast|kitchen|recipe"),
    ("Health", r"health|healthy|doctor|sick|hospital|exercise|sleep|medicine|illness|disease|brain"),
    ("Travel", r"travel|trip|vacation|hotel|airport|tourist|tourism|visit"),
    ("Getting Around", r"bus|train|car|drive|driving|directions|subway|metro|bike|traffic"),
    ("Shopping & Services", r"shop|shopping|store|buy|money|bank|price|mall|pay"),
    ("Work", r"work|job|jobs|office|interview|boss|career|business|workplace"),
    ("Family & Friends", r"family|friend|friends|parent|parents|wedding|birthday|mother|father|neighbor|children|kids"),
    ("Free Time", r"movie|movies|music|sport|sports|game|games|hobby|party|book|books|holiday|museum"),
    ("Weather & Outdoors", r"weather|rain|snow|park|outside|nature|garden|climate"),
    ("Home & Routine", r"home|house|apartment|morning|routine|room|clean|cleaning"),
    ("Talking About Yourself", r"yourself|introduce|feel|feeling|feelings|personality|opinion"),
]

ARTICLE_LINK = re.compile(r"/a/(?:[^/\"'?#]+/)?(\d{7})\.html")
LESSON_LINK = re.compile(r"/a/[^/\"'?#]+/(\d{7})\.html")
MEDIA_URL = re.compile(r"(?:https?:)?//[^\s\"'<>\\]+?\.(?:mp3|mp4|m3u8)(?:\?[^\s\"'<>\\]*)?", re.I)
# Text after these on an article page is not read in the audio.
CUT_MARKERS = re.compile(
    r"^(words in this story|words in the story|new words|vocabulary|quiz\b|test yourself|try it\b|_{3,}|do you have a question)",
    re.I,
)
SPEAKER_LABEL = re.compile(r"^([A-Z][\w.'’-]*(?: [A-Z][\w.'’-]*){0,2}):\s+")
NON_SPEECH = re.compile(r"\[[^\]]*\]|\((?:[A-Z ]+|music|sound[^)]*|laughter)\)", re.I)
TITLE_ABBREVIATIONS = {"Mr.", "Mrs.", "Ms.", "Dr.", "St.", "Prof."}
SENTENCE_END = re.compile(r"(?<=[.!?])[\"”’)]?\s+(?=[\"“‘(]?[A-Z0-9])")

session = requests.Session()
session.headers["User-Agent"] = USER_AGENT


def log(message: str) -> None:
    print(message, flush=True)


def fetch_html(url: str) -> str:
    time.sleep(PAGE_PAUSE_S)
    res = session.get(url, timeout=30)
    res.raise_for_status()
    # Dry runs keep the pages (uploaded as a workflow artifact) so the parser can be checked offline.
    dump_dir = os.environ.get("DUMP_DIR")
    if dump_dir:
        Path(dump_dir).mkdir(parents=True, exist_ok=True)
        name = re.sub(r"[^A-Za-z0-9.-]+", "_", url.split("://", 1)[-1])[:150]
        Path(dump_dir, f"{name}.html").write_text(res.text, encoding="utf-8")
    return res.text


def normalize_name(text: str) -> str:
    text = text.lower().replace("’", "'").replace("&", "and")
    return re.sub(r"[^a-z0-9']+", " ", text).strip()


# ---------- discovery ----------


def find_section_urls(wanted: list[str]) -> dict[str, str]:
    """Maps program keys to section URLs by matching link text in the site navigation."""
    html = fetch_html(SITE + "/")
    soup = BeautifulSoup(html, "html.parser")
    links: list[tuple[str, str]] = []
    for a in soup.find_all("a", href=True):
        text = normalize_name(a.get_text(" ", strip=True))
        href = urljoin(SITE, a["href"])
        if text and re.search(r"/(z|p)/\d+", urlparse(href).path):
            links.append((text, href.split("?")[0]))
    found: dict[str, str] = {}
    for key in wanted:
        names = [normalize_name(n) for n in PROGRAMS[key].names]
        match = next((href for name in names for text, href in links if text == name), None)
        match = match or next((href for name in names for text, href in links if text.startswith(name)), None)
        if match:
            found[key] = match
    missing = [k for k in wanted if k not in found]
    if missing:
        log(f"Could not find sections for: {', '.join(missing)}. Section links on the home page:")
        for text, href in sorted(set(links)):
            log(f"  {text!r} -> {href}")
    return found


def list_section_articles(section_url: str) -> list[int]:
    # Program pages (/p/) list their lessons once, with a slug; bare /a/<id>.html links there are guides.
    is_program_page = "/p/" in section_url
    ids: set[int] = set()
    for page in range(MAX_SECTION_PAGES):
        url = section_url if page == 0 else f"{section_url}?p={page}"
        try:
            html = fetch_html(url)
        except requests.HTTPError as error:
            log(f"  {url}: {error}")
            break
        page_ids = {int(m) for m in (LESSON_LINK if is_program_page else ARTICLE_LINK).findall(html)}
        if not page_ids - ids:
            break
        ids |= page_ids
    return sorted(ids)


# ---------- article parsing ----------


@dataclass
class Article:
    article_id: int
    url: str
    title: str
    image_url: str | None
    media_url: str
    paragraphs: list[str] = field(default_factory=list)
    section_paths: list[str] = field(default_factory=list)


def pick_media_url(html: str) -> str | None:
    # Player settings are often JSON inside the page, with escaped slashes.
    text = html.replace("\\/", "/")
    urls = list(dict.fromkeys(u if u.startswith("http") else "https:" + u for u in MEDIA_URL.findall(text)))
    mp3 = [u for u in urls if re.search(r"\.mp3", u, re.I)]
    if mp3:
        return mp3[0]
    mp4 = [u for u in urls if re.search(r"\.mp4", u, re.I)]
    if not mp4:
        # ffmpeg reads HLS playlists directly.
        hls = [u for u in urls if re.search(r"\.m3u8", u, re.I)]
        return hls[0] if hls else None
    # Smallest video rendition is enough for the soundtrack.
    def resolution(u: str) -> int:
        m = re.search(r"_(\d{3,4})p?\.mp4", u)
        return int(m.group(1)) if m else 9999
    return min(mp4, key=resolution)


def parse_article(article_id: int, url: str) -> Article | None:
    html = fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")
    og_title = soup.find("meta", property="og:title")
    title = (og_title.get("content") if og_title else None) or (soup.h1.get_text(" ", strip=True) if soup.h1 else "")
    title = re.sub(r"\s*[|-]\s*VOA.*$", "", title).strip()[:200]
    og_image = soup.find("meta", property="og:image")
    image_url = og_image.get("content") if og_image else None
    if image_url:
        image_url = re.sub(r"_w\d+_", "_w640_", image_url)
    section_paths = re.findall(r"/[zp]/\d+", html)
    body = soup.select_one("div.wsw")
    if not title or not body:
        log(f"  {article_id}: no {'title' if not title else 'article text'}, skipped")
        return None

    # The text that follows a player (up to the next heading) is that player's transcript: news-style
    # pages have one audio player and the story, Let's Learn English pages have several videos and a
    # "Conversation" audio followed by the dialogue. The player with the most text wins.
    segments: list[tuple[str | None, list[str]]] = [(None, [])]
    for el in body.find_all(True):
        classes = " ".join(el.get("class", []))
        if el.find_parent(class_="media-pholder"):
            continue
        if "media-pholder" in classes:
            segments.append((pick_media_url(str(el)), []))
            continue
        if el.name in ("h2", "h3", "h4"):
            if CUT_MARKERS.match(el.get_text(" ", strip=True)):
                break
            segments.append((None, []))
            continue
        if el.name not in ("p", "div") or el.find(["p", "div"]):
            continue
        text = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
        if CUT_MARKERS.match(text):
            break
        text = re.sub(r"\s+", " ", SPEAKER_LABEL.sub("", NON_SPEECH.sub(" ", text))).strip()
        if len(re.findall(r"[A-Za-z]", text)) >= 2:
            segments[-1][1].append(text)
    # Text before any player belongs to the page's main player (outside the article body).
    lead_media, lead_text = segments[0]
    segments[0] = (lead_media or pick_media_url(html), lead_text)
    with_media = [(m, t) for m, t in segments if m and t]
    if not with_media:
        log(f"  {article_id}: no audio or video with a transcript, skipped")
        return None
    media_url, paragraphs = max(with_media, key=lambda seg: sum(len(p.split()) for p in seg[1]))
    return Article(article_id, url, title, image_url, media_url, paragraphs, section_paths)


# ---------- audio and alignment ----------


def encode_mp3(source: str, out_path: Path) -> None:
    http_options = ["-user_agent", USER_AGENT] if source.startswith("http") else []
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", *http_options, "-i", source, "-vn", "-ac", "1", "-ar", "22050", "-b:a", "48k", str(out_path)],
        check=True,
    )


def prepare_audio(media_url: str, out_path: Path) -> float:
    if re.search(r"\.m3u8", media_url, re.I):
        encode_mp3(media_url, out_path)
    else:
        with tempfile.NamedTemporaryFile(suffix=Path(urlparse(media_url).path).suffix, delete=False) as raw:
            with session.get(media_url, timeout=120, stream=True) as res:
                res.raise_for_status()
                for chunk in res.iter_content(1 << 16):
                    raw.write(chunk)
            raw_path = raw.name
        try:
            encode_mp3(raw_path, out_path)
        finally:
            os.unlink(raw_path)
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out_path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(probe.stdout.strip())


def norm_word(word: str) -> str:
    return re.sub(r"[^a-z0-9]", "", word.lower().replace("’", "'"))


_model = None


def transcribe_words(audio_path: Path) -> list[tuple[str, float, float]]:
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        _model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    # Decoded with ffmpeg rather than faster-whisper's PyAV path, which breaks on PyAV 15.
    import numpy as np

    pcm = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(audio_path), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
        check=True,
        capture_output=True,
    ).stdout
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    segments, _ = _model.transcribe(audio, language="en", word_timestamps=True, beam_size=1)
    words: list[tuple[str, float, float]] = []
    for segment in segments:
        for w in segment.words or []:
            n = norm_word(w.word)
            if n:
                words.append((n, w.start, w.end))
    return words


def split_sentences(paragraphs: list[str]) -> list[list[str]]:
    sentences: list[list[str]] = []
    for paragraph in paragraphs:
        parts = [p.split() for p in SENTENCE_END.split(paragraph) if p.strip()]
        for tokens in parts:
            # "Ms. Weaver" is not two sentences.
            if sentences and sentences[-1][-1] in TITLE_ABBREVIATIONS:
                sentences[-1].extend(tokens)
            else:
                sentences.append(tokens)
    return sentences


def align(sentences: list[list[str]], heard: list[tuple[str, float, float]]):
    """Times every transcript word from the Whisper words it matches; unmatched words are interpolated."""
    flat = [(si, token) for si, tokens in enumerate(sentences) for token in tokens]
    ref = [norm_word(token) for _, token in flat]
    hyp = [w[0] for w in heard]
    matcher = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
    match_of: dict[int, int] = {}
    for block in matcher.get_matching_blocks():
        for k in range(block.size):
            if ref[block.a + k]:
                match_of[block.a + k] = block.b + k
    coverage = len(match_of) / max(len(hyp), 1)

    anchors = sorted(match_of.items())
    starts: list[float] = []
    ends: list[float] = []
    anchor_pos = 0
    for i in range(len(ref)):
        if i in match_of:
            _, s, e = heard[match_of[i]]
            starts.append(s)
            ends.append(e)
            continue
        while anchor_pos < len(anchors) and anchors[anchor_pos][0] < i:
            anchor_pos += 1
        prev = anchors[anchor_pos - 1] if anchor_pos > 0 else None
        nxt = anchors[anchor_pos] if anchor_pos < len(anchors) else None
        if prev and nxt:
            t0, t1 = heard[prev[1]][2], heard[nxt[1]][1]
            t = t0 + (t1 - t0) * (i - prev[0]) / (nxt[0] - prev[0])
        elif prev:
            t = heard[prev[1]][2]
        elif nxt:
            t = heard[nxt[1]][1]
        else:
            t = 0.0
        starts.append(t)
        ends.append(t)

    timed: list[dict] = []
    index = 0
    for tokens in sentences:
        idx = list(range(index, index + len(tokens)))
        index += len(tokens)
        countable = [i for i in idx if ref[i]]
        matched = [i for i in countable if i in match_of]
        if not countable or len(matched) / len(countable) < MIN_SENTENCE_MATCH:
            continue
        for part in split_long(tokens, [starts[i] for i in idx], [ends[i] for i in idx]):
            timed.append(part)
    return timed, coverage


def split_long(tokens: list[str], starts: list[float], ends: list[float]) -> list[dict]:
    duration = ends[-1] - starts[0]
    if duration <= MAX_SENTENCE_SEC or len(tokens) < 6:
        return [{"tokens": tokens, "start": starts[0], "end": ends[-1], "wordStarts": starts}]
    middle = len(tokens) // 2
    commas = [i for i in range(2, len(tokens) - 2) if re.search(r"[,;:]$", tokens[i])]
    cut = min(commas, key=lambda i: abs(i - middle)) + 1 if commas else middle
    return split_long(tokens[:cut], starts[:cut], ends[:cut]) + split_long(tokens[cut:], starts[cut:], ends[cut:])


def to_lesson_sentences(timed: list[dict], duration: float) -> list[dict]:
    out: list[dict] = []
    for i, part in enumerate(timed):
        start = max(0.0, part["start"] - START_PAD_S)
        end = min(duration, part["end"] + END_PAD_S)
        if out and start < out[-1]["end"]:
            start = out[-1]["end"]
        if i + 1 < len(timed):
            end = min(end, max(timed[i + 1]["start"] - START_PAD_S, start + 0.4))
        end = max(end, start + 0.4)
        out.append(
            {
                "start": round(start, 2),
                "end": round(end, 2),
                "text": " ".join(part["tokens"]),
                "wordStarts": [round(max(t, start), 2) for t in part["wordStarts"]],
            }
        )
    return out


def pick_topic(title: str, default: str) -> str:
    lower = title.lower()
    for topic, pattern in TOPIC_KEYWORDS:
        if re.search(rf"\b(?:{pattern})\b", lower):
            return topic
    return default


def format_duration(seconds: float) -> str:
    total = int(round(seconds))
    return f"{total // 60}:{total % 60:02d}"


# ---------- Supabase ----------


class Supabase:
    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.headers = {"apikey": key, "Authorization": f"Bearer {key}"}

    def stored_ids(self) -> set[str]:
        res = requests.get(f"{self.url}/rest/v1/lessons", params={"select": "video_id", "video_id": "like.voa-*"}, headers=self.headers, timeout=30)
        res.raise_for_status()
        return {row["video_id"] for row in res.json()}

    def upload(self, path: str, data: bytes, content_type: str) -> None:
        res = requests.post(
            f"{self.url}/storage/v1/object/{BUCKET}/{path}",
            data=data,
            headers={**self.headers, "Content-Type": content_type, "x-upsert": "true", "Cache-Control": "max-age=31536000"},
            timeout=120,
        )
        res.raise_for_status()

    def upsert(self, table: str, row: dict) -> None:
        res = requests.post(
            f"{self.url}/rest/v1/{table}",
            data=json.dumps(row),
            headers={**self.headers, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"},
            timeout=30,
        )
        if res.status_code >= 400:
            raise RuntimeError(f"{table} upsert failed: {res.status_code} {res.text}")


# ---------- main ----------


def import_article(article: Article, program: Program, db: Supabase | None, work: Path) -> dict | None:
    video_id = f"voa-{article.article_id}"
    sentences = split_sentences(article.paragraphs)
    if len(sentences) < MIN_SENTENCES:
        log(f"  {video_id}: only {len(sentences)} transcript sentences on the page, skipped")
        return None
    audio_path = work / f"{article.article_id}.mp3"
    duration = prepare_audio(article.media_url, audio_path)
    heard = transcribe_words(audio_path)
    timed, coverage = align(sentences, heard)
    lesson_sentences = to_lesson_sentences(timed, duration)
    log(f"  {video_id}: {format_duration(duration)}, {len(lesson_sentences)}/{len(sentences)} sentences timed, audio coverage {coverage:.0%}")
    if coverage < MIN_AUDIO_COVERAGE or len(lesson_sentences) < MIN_SENTENCES:
        log(f"  {video_id}: transcript doesn't match the audio well enough, skipped")
        return None
    for s in lesson_sentences[:3]:
        log(f"    [{s['start']:.2f}-{s['end']:.2f}] {s['text']}")

    topic = pick_topic(article.title, program.topic)
    if db:
        db.upload(f"voa/{article.article_id}.mp3", audio_path.read_bytes(), "audio/mpeg")
        if article.image_url:
            image = session.get(article.image_url, timeout=60)
            if image.ok:
                db.upload(f"voa/{article.article_id}.jpg", image.content, image.headers.get("Content-Type", "image/jpeg").split(";")[0])
        db.upsert(
            "lessons",
            {
                "video_id": video_id,
                "title": article.title,
                "author": CHANNEL,
                "duration_sec": int(round(duration)),
                "sentences": lesson_sentences,
                "has_translation": False,
                "caption_source": "aligned",
            },
        )
        db.upsert(
            "videos",
            {
                "video_id": video_id,
                "title": article.title,
                "level": program.level,
                "topic": topic,
                "duration": format_duration(duration),
                "channel": CHANNEL,
                "collection_id": COLLECTION,
                "is_published": True,
                # VOA article ids grow over time, so lessons stay in publishing order (Lesson 1, 2, ...).
                "sort_order": article.article_id,
            },
        )
    audio_path.unlink(missing_ok=True)
    return {"id": video_id, "title": article.title, "level": program.level, "topic": topic, "duration": format_duration(duration), "sentences": len(lesson_sentences)}


def main() -> int:
    is_dry_run = os.environ.get("DRY_RUN", "").lower() == "true"
    limit = int(os.environ.get("LIMIT") or "20")
    wanted = [k.strip() for k in (os.environ.get("PROGRAMS") or ",".join(PROGRAMS)).split(",") if k.strip()]
    unknown = [k for k in wanted if k not in PROGRAMS]
    if unknown:
        log(f"Unknown programs: {', '.join(unknown)}. Known: {', '.join(PROGRAMS)}")
        return 1
    urls = (os.environ.get("URLS") or "").split()

    db = None
    if not is_dry_run:
        url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            log("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (repository secrets).")
            return 1
        db = Supabase(url, key)
    stored = db.stored_ids() if db else set()
    log(f"{len(stored)} VOA lessons already stored{' (dry run: nothing is written)' if is_dry_run else ''}")

    # (program key, article id, article url, section path to check) per candidate, oldest first per program.
    queues: list[list[tuple[str, int, str, str | None]]] = []
    if urls:
        direct: list[tuple[str, int, str, str | None]] = []
        for u in urls:
            m = ARTICLE_LINK.search(u)
            if m:
                direct.append((wanted[0], int(m.group(1)), u, None))
            else:
                check_path = None if "/p/" in u else urlparse(u).path
                direct += [(wanted[0], i, f"{SITE}/a/{i}.html", check_path) for i in list_section_articles(u)]
        queues.append(direct)
    else:
        for key, section in find_section_urls(wanted).items():
            ids = list_section_articles(section)
            log(f"{key}: {section} lists {len(ids)} articles")
            # Lessons on a program page don't link back to it, so only /z/ sections are checked.
            check_path = None if "/p/" in section else urlparse(section).path
            queues.append([(key, i, f"{SITE}/a/{i}.html", check_path) for i in ids])

    imported: list[dict] = []
    failures = 0
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        # Round-robin over programs so one run fills every program a little.
        while len(imported) < limit and any(queues):
            for queue in queues:
                while queue and len(imported) < limit:
                    key, article_id, url, section_path = queue.pop(0)
                    if f"voa-{article_id}" in stored:
                        continue
                    try:
                        article = parse_article(article_id, url)
                        if article and section_path and section_path not in article.section_paths:
                            continue  # a "popular" or "related" link, not part of this program
                        log(f"{key} {article_id}: {article.title if article else '-'}")
                        result = import_article(article, PROGRAMS[key], db, work) if article else None
                    except Exception as error:  # one broken page must not stop the run
                        log(f"  {article_id}: failed: {error}")
                        failures += 1
                        result = None
                    if result:
                        imported.append(result)
                    break

    log(f"\nImported {len(imported)} lessons, {failures} failed.")
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as f:
            f.write(f"### VOA import{' (dry run)' if is_dry_run else ''}: {len(imported)} lessons, {failures} failed\n\n")
            f.write("| id | title | level | topic | length | sentences |\n|---|---|---|---|---|---|\n")
            for r in imported:
                f.write(f"| {r['id']} | {r['title']} | {r['level']} | {r['topic']} | {r['duration']} | {r['sentences']} |\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
