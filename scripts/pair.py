"""Side-by-side: our still (left) vs reference frame (right), labelled."""
import sys

from PIL import Image, ImageDraw

ours, ref, out, label = sys.argv[1:5]
vertical = len(sys.argv) > 5 and sys.argv[5] == 'v'
W, H = 960, 540
if vertical:
    # 9:16 still (left) next to the 16:9 reference for look comparison
    a0 = Image.open(ours).convert('RGB').resize((304, 540), Image.LANCZOS)
    a = Image.new('RGB', (W, H))
    a.paste(a0, ((W - 304) // 2, 0))
else:
    a = Image.open(ours).convert('RGB').resize((W, H), Image.LANCZOS)
try:
    b = Image.open(ref).convert('RGB').resize((W, H), Image.LANCZOS)
except FileNotFoundError:
    b = Image.new('RGB', (W, H))
im = Image.new('RGB', (W * 2 + 8, H), (40, 40, 40))
im.paste(a, (0, 0))
im.paste(b, (W + 8, 0))
d = ImageDraw.Draw(im)
d.text((12, 10), f'SPENDA t={label}s', fill=(255, 255, 0))
d.text((W + 20, 10), 'REFERENCE', fill=(255, 255, 0))
im.save(out)
