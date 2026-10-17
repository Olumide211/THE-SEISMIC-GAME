#!/usr/bin/env bash
# Mux the rendered PNG sequence (out/frames/element-###.png, frames 0-755) with the
# soundtrack into out/spenda-launch.mp4: 1920x1080, 30fps, H.264 high profile, high bitrate.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -y -framerate 30 -start_number 0 -i out/frames/element-%03d.png \
  -i assets/audio.mp3 \
  -map 0:v -map 1:a \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 12 -maxrate 40M -bufsize 80M \
  -x264-params "keyint=30:min-keyint=30" -movflags +faststart \
  -c:a aac -b:a 320k -af "afade=t=out:st=24.9:d=0.3" -t 25.2 \
  out/spenda-launch.mp4
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,width,height,r_frame_rate -of compact out/spenda-launch.mp4
