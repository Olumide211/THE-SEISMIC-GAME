#!/usr/bin/env bash
# Spenda Race: composite the 3D base frames + transparent caption frames, mux the ducked
# VO + music mix -> out/spenda-race.mp4 (1080x1920, 30fps, H.264 high, ~25 Mbps, AAC 320k).
#   base:     npm run race:frames   (layer=base, out/frames-race-base)
#   captions: npm run race:captions (layer=captions, out/frames-race-cap, transparent PNG)
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -framerate 30 -start_number 0 -i out/frames-race-base/element-%03d.png \
  -framerate 30 -start_number 0 -i out/frames-race-cap/element-%03d.png \
  -i public/race-mix.wav \
  -filter_complex "[0:v][1:v]overlay=0:0:format=auto,format=yuv420p[v]" \
  -map "[v]" -map 2:a \
  -c:v libx264 -preset slow -profile:v high -crf 14 -maxrate 25M -bufsize 50M \
  -x264-params "keyint=30:min-keyint=30" -movflags +faststart \
  -c:a aac -b:a 320k -t 30 \
  out/spenda-race.mp4
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,width,height,r_frame_rate -of compact out/spenda-race.mp4
