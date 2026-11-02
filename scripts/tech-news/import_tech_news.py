"""Imports a few AI articles from The Conversation for News > AI & Tech. Standard library only.

The Conversation allows republishing under CC BY-ND (https://theconversation.com/republishing-guidelines) with
these rules, which the importer and the reader keep: the words are not edited; authors, their institutions and
The Conversation are credited with a link; the page counter is shown; images are left out because their rights
differ; and not everything is republished, so each run takes only a few articles.

Runs in GitHub Actions (.github/workflows/import-tech-news.yml); needs migration 025.
Settings come from environment variables:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   required unless DRY_RUN
  LIMIT     new articles in this run (default 1)
  DRY_RUN   "true" to print what would be stored, including levels, and write nothing
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

FEED_URL = "https://theconversation.com/topics/artificial-intelligence-ai-90/articles.atom"
USER_AGENT = "Mozilla/5.0 (compatible; ShadowingAppImporter/1.0; +https://shadowing-app-liard.vercel.app)"
ATOM = {"a": "http://www.w3.org/2005/Atom"}
MIN_WORDS = 300
MAX_WORDS = 1800
BLOCK_TYPES = {"p": "p", "h2": "h", "h3": "h", "h4": "h", "li": "li"}
SKIPPED_TAGS = {"figure", "script", "style", "iframe"}
# The feed's AI tag also covers articles that only mention AI, so the title or summary must be about technology.
ON_TOPIC = re.compile(
    r"\b(AI|artificial intelligence|chatgpt|chatbots?|grok|claude|gemini|machine learning|algorithms?|software|coding|code|programm\w+|"
    r"computers?|cyber\w*|hack\w*|data cent\w+|internet|websites?|robots?|driverless|tech|technology|PHP|digital)\b",
    re.I,
)


class ArticleParser(HTMLParser):
    """Collects the article's text blocks, without its images and captions."""

    def __init__(self) -> None:
        super().__init__()
        self.blocks: list[dict] = []
        self.disclosure: str | None = None
        self.has_table = False
        self.skip_depth = 0
        self.block_depth = 0
        self.block_type = ""
        self.is_fine_print = False
        self.text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "table":
            self.has_table = True
        if tag in SKIPPED_TAGS:
            self.skip_depth += 1
        elif not self.skip_depth and tag in BLOCK_TYPES:
            if self.block_depth == 0:
                self.block_type = BLOCK_TYPES[tag]
                self.is_fine_print = "fine-print" in (dict(attrs).get("class") or "")
                self.text = []
            self.block_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in SKIPPED_TAGS:
            self.skip_depth = max(self.skip_depth - 1, 0)
        elif not self.skip_depth and tag in BLOCK_TYPES and self.block_depth > 0:
            self.block_depth -= 1
            if self.block_depth == 0:
                text = re.sub(r"\s+", " ", "".join(self.text)).strip()
                if text and self.is_fine_print:
                    self.disclosure = text
                elif text:
                    self.blocks.append({"type": self.block_type, "text": text})

    def handle_data(self, data: str) -> None:
        if self.block_depth and not self.skip_depth:
            self.text.append(data)


def count_syllables(word: str) -> int:
    groups = re.findall(r"[aeiouy]+", word.lower())
    count = len(groups)
    if word.lower().endswith("e") and not word.lower().endswith("le") and count > 1:
        count -= 1
    return max(count, 1)


def estimate_level(text: str) -> tuple[str, int]:
    """A rough CEFR level from the Flesch-Kincaid grade (sentence and word length), and the word count."""
    words = re.findall(r"[A-Za-z][A-Za-z'’-]*", text)
    sentences = max(len(re.findall(r"[.!?]+(?:\s|$)", text)), 1)
    if not words:
        return "C1", 0
    grade = 0.39 * len(words) / sentences + 11.8 * sum(count_syllables(w) for w in words) / len(words) - 15.59
    for limit, level in ((6, "A2"), (8.5, "B1"), (11.5, "B2"), (14.5, "C1")):
        if grade <= limit:
            return level, len(words)
    return "C2", len(words)


def fetch(url: str, headers: dict | None = None, data: bytes | None = None, method: str | None = None) -> bytes:
    request = urllib.request.Request(url, data=data, method=method, headers={"User-Agent": USER_AGENT, **(headers or {})})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def parse_entry(entry: ET.Element) -> dict | None:
    number = re.search(r"article/(\d+)$", entry.findtext("a:id", "", ATOM))
    content = entry.findtext("a:content", "", ATOM)
    counter = re.search(r'https://counter\.theconversation\.com/content/\d+/count\.gif', content)
    link = entry.find("a:link[@rel='alternate']", ATOM)
    if not number or not counter or link is None:
        return None
    parser = ArticleParser()
    parser.feed(content)
    if parser.has_table:
        return None  # a table can't be shown without it, and the text must stay whole
    level, word_count = estimate_level(" ".join(b["text"] for b in parser.blocks if b["type"] != "h"))
    if not MIN_WORDS <= word_count <= MAX_WORDS:
        return None
    if not ON_TOPIC.search(f"{entry.findtext('a:title', '', ATOM)} {entry.findtext('a:summary', '', ATOM)}"):
        return None
    return {
        "id": f"tc-{int(number.group(1)):08d}",
        "title": entry.findtext("a:title", "", ATOM).strip(),
        "summary": entry.findtext("a:summary", "", ATOM).strip(),
        "authors": [a.findtext("a:name", "", ATOM).strip() for a in entry.findall("a:author", ATOM)],
        "source_url": link.attrib["href"],
        "counter_url": counter.group(0),
        "published_at": entry.findtext("a:published", "", ATOM),
        "level": level,
        "word_count": word_count,
        "blocks": parser.blocks,
        "disclosure": parser.disclosure,
    }


def main() -> int:
    is_dry_run = os.environ.get("DRY_RUN", "").lower() == "true"
    limit = int(os.environ.get("LIMIT") or "1")
    url = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or ""
    if not is_dry_run and (not url or not key):
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return 1
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}

    stored: set[str] = set()
    if not is_dry_run:
        rows = json.loads(fetch(f"{url}/rest/v1/tech_articles?select=id", headers))
        stored = {row["id"] for row in rows}

    entries = ET.fromstring(fetch(FEED_URL)).findall("a:entry", ATOM)
    articles = [a for a in map(parse_entry, entries) if a]
    print(f"{len(entries)} in the feed, {len(articles)} usable, {len(stored)} already stored")
    articles.sort(key=lambda a: a["published_at"], reverse=True)

    imported = 0
    for article in articles:
        if is_dry_run:
            print(f"{article['id']} {article['level']} {article['word_count']}w {len(article['blocks'])} blocks: {ascii(article['title'])}")
            continue
        if imported >= limit or article["id"] in stored:
            continue
        fetch(
            f"{url}/rest/v1/tech_articles",
            {**headers, "Content-Type": "application/json", "Prefer": "return=minimal"},
            json.dumps(article).encode(),
            "POST",
        )
        imported += 1
        print(f"Stored {article['id']} ({article['level']}): {ascii(article['title'])}")
    print(f"Imported {imported} articles.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
