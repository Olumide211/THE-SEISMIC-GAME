#!/usr/bin/env bash
# Rebuild audio + captions + index.html, then carve the music bed under the VO.
set -euo pipefail
cd "$(dirname "$0")/../../.."   # repo root (uv project)
uv run python videos/spenda-breakup/build/compose_music.py
uv run python videos/spenda-breakup/build/assemble_audio.py
uv run python videos/spenda-breakup/build/build_index.py
cd videos/spenda-breakup
node ~/.claude/skills/hyperframes-audio/scripts/carve.mjs --comp index.html --bed music --voice vo | head -6
