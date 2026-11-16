"""Narrates stories on your computer, without GitHub Actions. Reads the Supabase keys from .env.local.

One-time setup (Kokoro needs Python 3.10-3.12; ffmpeg is optional, MP3 is encoded by libsndfile without it):
  uv venv --python 3.12 .venv-kokoro
  uv pip install --python .venv-kokoro -r scripts/story-audio/requirements.txt
  uv pip install --python .venv-kokoro https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl

Run from the repository root (Windows: .venv-kokoro\\Scripts\\python.exe):
  .venv-kokoro/bin/python scripts/story-audio/run_local.py [story ids...]
  e.g. scripts/story-audio/run_local.py grammar-past-simple story-00017
With no ids it narrates every story whose text changed. LIMIT and PREVIEW_VOICES work as in generate_audio.py.
"""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def load_env() -> None:
    names = {"NEXT_PUBLIC_SUPABASE_URL": "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY": "SUPABASE_SERVICE_ROLE_KEY"}
    for line in (REPO / ".env.local").read_text(encoding="utf-8").splitlines():
        name, _, value = line.partition("=")
        if name.strip() in names:
            os.environ.setdefault(names[name.strip()], value.strip().strip('"'))


def main() -> int:
    load_env()
    if sys.argv[1:]:
        os.environ["ONLY"] = ",".join(sys.argv[1:])
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    with tempfile.TemporaryDirectory() as folder:
        stories_path = Path(folder) / "stories.json"
        npx = "npx.cmd" if os.name == "nt" else "npx"
        with stories_path.open("w", encoding="utf-8") as out:
            subprocess.run([npx, "tsx", "scripts/story-audio/export-stories.ts"], cwd=REPO, stdout=out, check=True)
        os.environ["STORIES_JSON"] = str(stories_path)
        sys.path.insert(0, str(Path(__file__).parent))
        import generate_audio

        return generate_audio.main()


if __name__ == "__main__":
    sys.exit(main())
