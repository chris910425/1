"""Raw Grid, recoloured for NTU CCTF: white page, navy ink, NTU red accent.

Raw Grid's own rule is kept exactly — 3px lines that ARE the layout, cells that meet
without gaps, hard offset shadows, two quiet fills, heavy type — with its black
swapped for CCTF navy, its pink for NTU red and its green for CCTF pale blue.
White stays the page.
"""
from __future__ import annotations

import json
import pathlib
from xml.sax.saxutils import escape as esc  # noqa: F401  (re-exported)

# ---- tokens -----------------------------------------------------------------
PAPER = "#FFFFFF"       # the page
NAVY = "#0A1138"        # Raw Grid's ink: lines, text, hard shadows
NAVY_2 = "#2B3A77"
NAVY_3 = "#5A6AA8"
NAVY_4 = "#93A0C9"
NAVY_5 = "#C7CEE4"
RED = "#D21540"         # the accent: one thing per page
RED_PALE = "#F7D3DB"    # Raw Grid's pink
PALE = "#CBE0EC"        # CCTF pale blue, Raw Grid's green
GREY = "#F5F5F5"
MUTED = "#6B6B6B"
LINE = 3
SHADOW = 6

FONT = "Noto Sans TC"
MONO = "Consolas, Noto Sans TC"
TOTAL = 8               # slides, for the block-progress chain
MARGIN = 48


# ---- page -------------------------------------------------------------------
def page(role: str, body: str, bg: str = PAPER, defs: str = "") -> str:
    d = f"  <defs>\n{defs}  </defs>\n" if defs else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="zh-Hant" '
            f'data-pptx-page-role="{role}" font-family="{FONT}">\n{d}'
            f'  <rect id="bg" data-pptx-role="background" x="0" y="0" width="1280" height="720" fill="{bg}"/>\n'
            f'{body}</svg>\n')


def g(gid: str, bounds: str, *parts: str, role: str | None = None) -> str:
    r = f' data-pptx-role="{role}"' if role else ""
    return (f'  <g id="{gid}" data-pptx-bounds="{bounds}"{r}>\n    '
            + "\n    ".join(p for p in parts if p) + "\n  </g>\n")


# ---- lines, cells, cards ----------------------------------------------------
def hline(x, y, w, col=NAVY, t=LINE):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{t}" fill="{col}"/>'


def vline(x, y, h, col=NAVY, t=LINE):
    return f'<rect x="{x}" y="{y}" width="{t}" height="{h}" fill="{col}"/>'


def cell(x, y, w, h, fill=PAPER, stroke=None):
    s = f' stroke="{stroke}" stroke-width="{LINE}"' if stroke else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"{s}/>'


def card(x, y, w, h, fill=PAPER, shadow=SHADOW):
    s = f'<rect x="{x + shadow}" y="{y + shadow}" width="{w}" height="{h}" fill="{NAVY}"/>' if shadow else ""
    return s + cell(x, y, w, h, fill, stroke=NAVY)


def img(href, x, y, w, h, fit="xMidYMid slice"):
    return (f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" '
            f'preserveAspectRatio="{fit}"/>')


# ---- type -------------------------------------------------------------------
def ttl(x, y, s, size=64, fill=NAVY, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-weight="900" '
            f'font-size="{size}" fill="{fill}"{a}>{esc(s)}</text>')


def txt(x, y, s, size=20, fill=NAVY, weight=400, anchor=None, family=FONT, track=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    t = f' letter-spacing="{track}"' if track else ""
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-weight="{weight}" '
            f'font-size="{size}" fill="{fill}"{a}{t}>{esc(s)}</text>')


def para(x, y, lines, size=20, fill=MUTED, lead=1.6, weight=400):
    return "".join(txt(x, y + round(i * size * lead), ln, size, fill, weight)
                   for i, ln in enumerate(lines))


def label(x, y, s, size=13, fill=MUTED, anchor=None):
    """Small tracked Latin label. Chinese is never tracked."""
    tr = 1.2 if s.isascii() else None
    return txt(x, y, s, size, fill=fill, weight=700, anchor=anchor, track=tr)


def arrow_item(x, y, s, size=24, fill=NAVY):
    return txt(x, y, f"→　{s}", size, fill=fill, weight=700)


def ghost(x, y, n, size=120, fill=NAVY_5):
    return ttl(x, y, n, size, fill=fill)


# ---- header -----------------------------------------------------------------
def progress_chain(x, y, n, total=TOTAL, size=12, gap=6):
    return "".join(
        f'<rect x="{x + i * (size + gap)}" y="{y}" width="{size}" height="{size}" '
        f'fill="{NAVY if i == n - 1 else PAPER}" stroke="{NAVY}" stroke-width="2"/>'
        for i in range(total))


def header(title_text, n, right=None, total=TOTAL):
    w = 18 * total - 6
    return g("header", "0 0 1280 92",
             ttl(MARGIN, 62, title_text, 30),
             label(1232 - w - 24, 62, right, 13, anchor="end") if right else "",
             progress_chain(1232 - w, 46, n, total),
             hline(MARGIN, 90, 1280 - 2 * MARGIN))


def claim(x, y, s, size=44, rule=96):
    """The slide's one assertion, with the red rule under it."""
    return ttl(x, y, s, size) + hline(x, y + 20, rule, col=RED, t=5)


# ---- bars -------------------------------------------------------------------
def hbar(x, y, w, frac, fill=NAVY, h=26, track=True):
    inner = max(0.0, min(1.0, frac))
    s = cell(x, y, w, h, PAPER, stroke=NAVY) if track else ""
    return s + cell(x + LINE, y + LINE, round((w - 2 * LINE) * inner), h - 2 * LINE, fill)


# ---- doughnut (SVG fallback + PowerPoint native chart) ----------------------
def doughnut(key, cx, cy, data, r=142, sw=52, colors=None, gap=0.6):
    """Thin ring in the HTML library's style, plus PPT Master's native-chart marker
    so --native-charts-and-tables produces an editable PowerPoint chart."""
    cols = colors or [RED, NAVY, NAVY_2, NAVY_3, NAVY_4, NAVY_5]
    total = sum(v for _, v in data)
    segs, acc = [], 0.0
    for i, (_, v) in enumerate(data):
        pct = v / total * 100
        segs.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{cols[i % len(cols)]}" '
                    f'stroke-width="{sw}" pathLength="100" '
                    f'stroke-dasharray="{max(pct - gap, 0.35):.2f} 100" stroke-dashoffset="{-acc:.2f}"/>')
        acc += pct
    meta = {"x": cx - r - sw // 2, "y": cy - r - sw // 2, "width": 2 * r + sw, "height": 2 * r + sw,
            "name": key, "type": "doughnut", "categories": [l for l, _ in data],
            "series": [{"name": key, "values": [v for _, v in data]}], "show_legend": False,
            "style": {"colors": [cols[i % len(cols)] for i in range(len(data))]}}
    return (f'<g id="{key}" data-pptx-replace-with="chart">'
            f'<metadata type="application/json">{json.dumps(meta, ensure_ascii=False)}</metadata>'
            f'<g transform="rotate(-90 {cx} {cy})">' + "".join(segs) + "</g></g>")


# ---- Singapore outline ------------------------------------------------------
_GEO = None


def geo():
    global _GEO
    if _GEO is None:
        src = (pathlib.Path(__file__).resolve().parents[2]
               / ".claude/skills/frontend-slides/components/geo.js").read_text()
        _GEO = json.loads(src[src.index("{"):src.rindex("}") + 1])
    return _GEO


def sg_outline(x, y, w, fill=PALE, stroke=NAVY, t=LINE):
    """Real Singapore coastline (Natural Earth, public domain) drawn Raw Grid style."""
    pts = geo()["sg"]
    lon0, lon1 = min(p[0] for p in pts), max(p[0] for p in pts)
    lat0, lat1 = min(p[1] for p in pts), max(p[1] for p in pts)
    k = w / (lon1 - lon0)
    h = (lat1 - lat0) * k
    xy = [(x + (lon - lon0) * k, y + (lat1 - lat) * k) for lon, lat in pts]
    d = "M" + " L".join(f"{px:.1f} {py:.1f}" for px, py in xy) + " Z"
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{t}" stroke-linejoin="round"/>', h
