"""Measure a reference image's palette and suggest roles.

    python3 palette.py <image> [--crop x0,y0,x1,y1]

Three passes: the main colours by area, the vivid colours (small but saturated: usually the accent),
and the light colours (highlights, paper, foam). Then suggested roles: ground, ink, accent.
Eyeball the result against the image and pick clean mid-tones, not shadows.
"""
import argparse, colorsys
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument("image"); ap.add_argument("--crop"); a = ap.parse_args()
im = Image.open(a.image).convert("RGB")
if a.crop: im = im.crop(tuple(int(v) for v in a.crop.split(",")))
im.thumbnail((360, 360)); px = list(im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()); N = len(px)

def hls(p): return colorsys.rgb_to_hls(*(v / 255 for v in p))
def chroma(p): h, l, s = hls(p); return s * (1 - abs(2 * l - 1))
def lum(p):
    f = lambda v: v / 255 / 12.92 if v <= 10 else ((v / 255 + .055) / 1.055) ** 2.4
    return .2126 * f(p[0]) + .7152 * f(p[1]) + .0722 * f(p[2])
def contrast(p, q): a_, b_ = lum(p), lum(q); return (max(a_, b_) + .05) / (min(a_, b_) + .05)
def hx(p): return "#%02X%02X%02X" % tuple(p)

def clusters(pixels, k):
    if not pixels: return []
    s = Image.new("RGB", (len(pixels), 1)); s.putdata(pixels)
    q = s.quantize(k, method=Image.Quantize.MEDIANCUT, kmeans=4); pal = q.getpalette()
    return [(tuple(pal[i * 3:i * 3 + 3]), c / N) for c, i in sorted(q.getcolors(), reverse=True)]

main = clusters(px, 8)
vivid = clusters([p for p in px if chroma(p) > .22 and .2 < hls(p)[1] < .85], 4)
light = clusters([p for p in px if hls(p)[1] > .72], 3)

for title, rows in (("main (by area)", main), ("vivid (accent candidates)", vivid), ("light (highlights / paper)", light)):
    print(title); [print(f"  {hx(c)}  {s*100:5.1f}%   light {hls(c)[1]:.2f}  chroma {chroma(c):.2f}") for c, s in rows]

ground = main[0][0]
ink = max((c for c, s in main + light if s > .01), key=lambda c: contrast(c, ground))
# accent: the clean, saturated mid-tone of the vivid colours (not their shadow)
accent = max(vivid, key=lambda r: r[1] ** .5 * chroma(r[0]) ** 2 * (1 - abs(hls(r[0])[1] - .55)))[0] if vivid else None
print(f"\nsuggested  ground {hx(ground)}  ink {hx(ink)} ({contrast(ink, ground):.1f}:1)", end="")
print(f"  accent {hx(accent)} ({contrast(accent, ground):.1f}:1 on ground)" if accent else "  accent: none (monochrome)")
