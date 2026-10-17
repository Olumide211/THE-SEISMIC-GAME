"""Rasterize the Spenda S-mark (same geometry as assets/spenda-logo.svg) with Pillow.

usage: python logo_raster.py out.png SIZE [pad_fraction]
"""
import math
import sys

from PIL import Image, ImageDraw

# viewBox 0 0 90 124 -- (x0, y0, x1, y1, radii tl,tr,br,bl)
LEAVES = [
    (30, 0, 90, 60, (34, 7, 7, 7)),
    (0, 64, 60, 124, (7, 7, 34, 7)),
]


def leaf_points(x0, y0, x1, y1, radii, steps=48):
    tl, tr, br, bl = radii
    pts = []

    def arc(cx, cy, r, a0, a1):
        for i in range(steps + 1):
            a = math.radians(a0 + (a1 - a0) * i / steps)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))

    arc(x0 + tl, y0 + tl, tl, 180, 270)
    arc(x1 - tr, y0 + tr, tr, 270, 360)
    arc(x1 - br, y1 - br, br, 0, 90)
    arc(x0 + bl, y1 - bl, bl, 90, 180)
    return pts


def render(size, pad=0.15, ss=4):
    S = size * ss
    im = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(im)
    inner = S * (1 - 2 * pad)
    k = inner / 124.0
    ox = (S - 90 * k) / 2
    oy = (S - 124 * k) / 2
    for x0, y0, x1, y1, r in LEAVES:
        d.polygon([(ox + x * k, oy + y * k) for x, y in leaf_points(x0, y0, x1, y1, r)], fill=255)
    return im.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    out, size = sys.argv[1], int(sys.argv[2])
    pad = float(sys.argv[3]) if len(sys.argv) > 3 else 0.15
    render(size, pad).save(out)
