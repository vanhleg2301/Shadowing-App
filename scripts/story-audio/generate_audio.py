"""Narrates the daily stories with Kokoro (open-weight, Apache 2.0) and stores the audio for the app.

Each sentence is generated separately, so its exact time in the final MP3 is known. Stories with an unchanged
text are skipped. Runs in GitHub Actions (.github/workflows/story-audio.yml); needs migration 024.
Settings come from environment variables:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   required
  STORIES_JSON   output of export-stories.ts
  ONLY           optional comma-separated story ids
  LIMIT          optional number of stories to generate in this run
  PREVIEW_VOICES optional voice pairs to compare, e.g. af_bella+bm_lewis,af_nicole+bm_george: narrates the
                 ONLY stories with each pair into stories/preview/ and leaves the app's audio alone
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import requests
import soundfile
from kokoro import KPipeline

BUCKET = "lesson-media"
SAMPLE_RATE = 24000
SENTENCE_PAUSE_S = 0.25
LINE_PAUSE_S = 0.5
# The narrator and first speaker, then the second speaker of a dialogue. A voice's first letter is its accent:
# "a" American English, "b" British.
Voices = tuple[str, str]
DEFAULT_VOICES: Voices = ("af_heart", "bm_george")
# Part of the text hash: raise it when the way audio is generated changes, so every story is narrated again.
GENERATION = 2


def log(message: str) -> None:
    print(message, flush=True)


def get_voice(story: dict, speaker: str | None, voices: Voices) -> str:
    speakers = list(dict.fromkeys(line["speaker"] for line in story["lines"] if line["speaker"]))
    return voices[1] if speaker and speakers.index(speaker) == 1 else voices[0]


def get_text_hash(story: dict) -> str:
    source = json.dumps([story["lines"], DEFAULT_VOICES, GENERATION], sort_keys=True)
    return hashlib.sha256(source.encode()).hexdigest()[:12]


def synthesize(pipeline: KPipeline, text: str, voice: str) -> tuple[np.ndarray, list[tuple[str, float | None, float | None]]]:
    """The audio for a text, and each of Kokoro's tokens with its time in that audio."""
    chunks: list[np.ndarray] = []
    tokens: list[tuple[str, float | None, float | None]] = []
    length = 0
    for result in pipeline(text, voice=voice, speed=1.0):
        if result.audio is None:
            continue
        audio = np.asarray(result.audio)
        offset = length / SAMPLE_RATE
        for token in result.tokens or []:
            start = token.start_ts + offset if token.start_ts is not None else None
            end = token.end_ts + offset if token.end_ts is not None else None
            tokens.append((token.text, start, end))
        chunks.append(audio)
        length += len(audio)
    if not chunks:
        raise RuntimeError(f"No audio for: {text}")
    return np.concatenate(chunks), tokens


def count_letters(text: str) -> int:
    return sum(c.isalnum() for c in text)


def time_sentences(sentences: list[str], tokens: list[tuple[str, float | None, float | None]]) -> list[tuple[float, float]] | None:
    """Finds where each sentence starts and ends by walking the tokens, counting letters and digits because
    tokens split words and punctuation their own way. None when they can't be matched up."""
    if sum(count_letters(t[0]) for t in tokens) != sum(count_letters(s) for s in sentences):
        return None
    times: list[tuple[float, float]] = []
    index = 0
    for sentence in sentences:
        remaining = count_letters(sentence)
        starts: list[float] = []
        ends: list[float] = []
        while remaining > 0:
            text, start, end = tokens[index]
            index += 1
            remaining -= count_letters(text)
            if count_letters(text) and start is not None:
                starts.append(start)
            if count_letters(text) and end is not None:
                ends.append(end)
        if remaining < 0 or not starts or not ends:
            return None
        times.append((starts[0], ends[-1]))
    return times


def narrate(story: dict, pipelines: dict[str, KPipeline], voices: Voices = DEFAULT_VOICES) -> tuple[np.ndarray, list[dict]]:
    """Each line is read in one go, which keeps its intonation flowing from sentence to sentence. A line
    whose sentence times can't be found is read one sentence at a time instead."""
    parts: list[np.ndarray] = []
    timings: list[dict] = []
    position = 0

    def add(audio: np.ndarray) -> None:
        nonlocal position
        parts.append(audio)
        position += len(audio)

    def add_pause(seconds: float) -> None:
        add(np.zeros(int(seconds * SAMPLE_RATE), dtype=np.float32))

    for line in story["lines"]:
        pipeline = pipelines[(voice := get_voice(story, line["speaker"], voices))[0]]
        if parts:
            add_pause(LINE_PAUSE_S)
        audio, tokens = synthesize(pipeline, " ".join(line["sentences"]), voice)
        times = time_sentences(line["sentences"], tokens)
        if times:
            for sentence, (start, end) in zip(line["sentences"], times):
                timings.append({"text": sentence, "start": round(position / SAMPLE_RATE + start, 2), "end": round(position / SAMPLE_RATE + end, 2)})
            add(audio)
            continue
        log(f"  {story['id']}: no sentence times for a line, reading it sentence by sentence")
        for i, sentence in enumerate(line["sentences"]):
            if i > 0:
                add_pause(SENTENCE_PAUSE_S)
            audio, _ = synthesize(pipeline, sentence, voice)
            timings.append({"text": sentence, "start": round(position / SAMPLE_RATE, 2), "end": round((position + len(audio)) / SAMPLE_RATE, 2)})
            add(audio)
    return np.concatenate(parts), timings


def encode_mp3(audio: np.ndarray, path: Path) -> None:
    wav_path = path.with_suffix(".wav")
    soundfile.write(wav_path, audio, SAMPLE_RATE)
    # Constant bitrate, so seeking to a sentence lands on the right moment in every browser.
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "56k", str(path)], check=True)
    wav_path.unlink()


def main() -> int:
    url = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    stories = json.loads(Path(os.environ["STORIES_JSON"]).read_text(encoding="utf-8"))
    only = {s.strip() for s in os.environ.get("ONLY", "").split(",") if s.strip()}
    limit = int(os.environ.get("LIMIT") or len(stories))

    res = requests.get(f"{url}/rest/v1/story_audio", params={"select": "story_id,text_hash"}, headers=headers, timeout=30)
    res.raise_for_status()
    stored = {row["story_id"]: row["text_hash"] for row in res.json()}
    pending = [s for s in stories if (not only or s["id"] in only) and stored.get(s["id"]) != get_text_hash(s)][:limit]
    log(f"{len(pending)} stories to narrate, {len(stored)} already stored")

    previews = [tuple(pair.split("+")) for pair in os.environ.get("PREVIEW_VOICES", "").split(",") if pair.strip()]
    if previews:
        pending = [s for s in stories if s["id"] in only]

    pipelines = {"a": KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M"), "b": KPipeline(lang_code="b", repo_id="hexgrad/Kokoro-82M")}
    done = 0
    failed = 0
    with tempfile.TemporaryDirectory() as tmp:
        for story, voices in ((s, v) for s in pending for v in previews):
            audio, timings = narrate(story, pipelines, voices)
            mp3_path = Path(tmp) / f"{story['id']}.mp3"
            encode_mp3(audio, mp3_path)
            audio_path = f"stories/preview/{story['id']}-{voices[0]}-{voices[1]}.mp3"
            upload = requests.post(
                f"{url}/storage/v1/object/{BUCKET}/{audio_path}",
                data=mp3_path.read_bytes(),
                headers={**headers, "Content-Type": "audio/mpeg", "x-upsert": "true", "Cache-Control": "max-age=60"},
                timeout=120,
            )
            upload.raise_for_status()
            log(f"{timings[-1]['end']:.0f}s {url}/storage/v1/object/public/{BUCKET}/{audio_path}")
        if previews:
            return 0
        for story in pending:
            try:
                text_hash = get_text_hash(story)
                audio, timings = narrate(story, pipelines)
                mp3_path = Path(tmp) / f"{story['id']}.mp3"
                encode_mp3(audio, mp3_path)
                # The hash is in the name because audio files are cached for a year.
                audio_path = f"stories/{story['id']}-{text_hash}.mp3"
                upload = requests.post(
                    f"{url}/storage/v1/object/{BUCKET}/{audio_path}",
                    data=mp3_path.read_bytes(),
                    headers={**headers, "Content-Type": "audio/mpeg", "x-upsert": "true", "Cache-Control": "max-age=31536000"},
                    timeout=120,
                )
                upload.raise_for_status()
                row = requests.post(
                    f"{url}/rest/v1/story_audio",
                    data=json.dumps({"story_id": story["id"], "audio_path": audio_path, "text_hash": text_hash, "sentences": timings}),
                    headers={**headers, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"},
                    timeout=30,
                )
                row.raise_for_status()
                done += 1
                log(f"[{done}/{len(pending)}] {story['id']}: {timings[-1]['end']:.0f}s, {mp3_path.stat().st_size // 1024} KB")
            except Exception as error:  # one failed story must not stop the run
                failed += 1
                log(f"  {story['id']}: failed: {error}")

    log(f"\nNarrated {done} stories, {failed} failed.")
    return 1 if failed and not done else 0


if __name__ == "__main__":
    sys.exit(main())
