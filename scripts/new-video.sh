#!/usr/bin/env bash
# Create a self-contained HyperFrames project at videos/<name>.
# HyperFrames refuses asset paths that climb out of the project ("../"),
# so GSAP, Three.js and the fonts are copied in rather than referenced.
set -euo pipefail
name="${1:?usage: scripts/new-video.sh <name>}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dir="$root/videos/$name"
[ -e "$dir" ] && { echo "videos/$name already exists" >&2; exit 1; }
mkdir -p "$dir/vendor" "$dir/assets/fonts" "$dir/assets/sfx" "$dir/assets/audio"
cp "$root/node_modules/gsap/dist/gsap.min.js" "$dir/vendor/"
cp "$root/node_modules/three/build/"{three.module.js,three.core.js} "$dir/vendor/"
cp "$root/assets/fonts/"*.woff2 "$root/assets/fonts/fonts.css" "$dir/assets/fonts/"
cp "$root/videos/smoke-test/index.html" "$dir/index.html"
echo "Created videos/$name — edit index.html, then:"
echo "  cd videos/$name && npx hyperframes check && npx hyperframes render"
