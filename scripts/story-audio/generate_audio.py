"""Narrates the daily stories with Kokoro (open-weight, Apache 2.0) and stores the audio for the app.

Each sentence is generated separately, so its exact time in the final MP3 is known. Stories with an unchanged
text are skipped. Runs in GitHub Actions (.github/workflows/story-audio.yml); needs migration 024.
Settings come from environment variables:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   required
  STORIES_JSON   output of export-stories.ts
  ONLY           optional comma-separated story ids
  LIMIT          optional number of stories to generate in this run
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
# (language code, voice): "a" is American English, "b" is British. The second speaker of a dialogue gets the
# other accent, as in the browser voices these replace.
FIRST_VOICE = ("a", "af_heart")
SECOND_VOICE = ("b", "bm_george")


def log(message: str) -> None:
    print(message, flush=True)


def get_voice(story: dict, speaker: str | None) -> tuple[str, str]:
    speakers = list(dict.fromkeys(line["speaker"] for line in story["lines"] if line["speaker"]))
    return SECOND_VOICE if speaker and speakers.index(speaker) == 1 else FIRST_VOICE


def get_text_hash(story: dict) -> str:
    source = json.dumps([story["lines"], FIRST_VOICE, SECOND_VOICE], sort_keys=True)
    return hashlib.sha256(source.encode()).hexdigest()[:12]


def synthesize(pipeline: KPipeline, text: str, voice: str) -> np.ndarray:
    chunks = [np.asarray(result.audio) for result in pipeline(text, voice=voice, speed=1.0) if result.audio is not None]
    if not chunks:
        raise RuntimeError(f"No audio for: {text}")
    return np.concatenate(chunks)


def narrate(story: dict, pipelines: dict[str, KPipeline]) -> tuple[np.ndarray, list[dict]]:
    parts: list[np.ndarray] = []
    timings: list[dict] = []
    position = 0
    for line in story["lines"]:
        lang, voice = get_voice(story, line["speaker"])
        for i, sentence in enumerate(line["sentences"]):
            if parts:
                pause = np.zeros(int((SENTENCE_PAUSE_S if i > 0 else LINE_PAUSE_S) * SAMPLE_RATE), dtype=np.float32)
                parts.append(pause)
                position += len(pause)
            audio = synthesize(pipelines[lang], sentence, voice)
            timings.append({"text": sentence, "start": round(position / SAMPLE_RATE, 2), "end": round((position + len(audio)) / SAMPLE_RATE, 2)})
            parts.append(audio)
            position += len(audio)
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

    pipelines = {"a": KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M"), "b": KPipeline(lang_code="b", repo_id="hexgrad/Kokoro-82M")}
    done = 0
    failed = 0
    with tempfile.TemporaryDirectory() as tmp:
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
