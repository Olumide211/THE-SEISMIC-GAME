"""Contact sheet: rendered frames (out/frames) next to the nearest reference frames.

usage: python3 scripts/review.py out.png 3.0 3.5 4.0 ...
"""
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, *times = sys.argv[1:]
W, H = 640, 360
rows = []
for s in times:
    t = float(s)
    f = os.path.join(ROOT, 'out/frames', f'element-{round(t * 30):03d}.png')
    r = os.path.join(ROOT, 'ref-frames', f'f_{round(t * 4):03d}.png')
    a = Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS) if os.path.exists(f) else Image.new('RGB', (W, H))
    b = Image.open(r).convert('RGB').resize((W, H), Image.LANCZOS) if os.path.exists(r) else Image.new('RGB', (W, H))
    rows.append((s, a, b))
cols = 2
sheet = Image.new('RGB', (cols * (W * 2 + 12), ((len(rows) + cols - 1) // cols) * (H + 6)), (50, 50, 50))
for i, (s, a, b) in enumerate(rows):
    x = (i % cols) * (W * 2 + 12)
    y = (i // cols) * (H + 6)
    sheet.paste(a, (x, y))
    sheet.paste(b, (x + W + 2, y))
    d = ImageDraw.Draw(sheet)
    d.text((x + 8, y + 6), f'SPENDA {s}s', fill=(255, 255, 0))
    d.text((x + W + 10, y + 6), 'REF', fill=(255, 255, 0))
sheet.save(out)
