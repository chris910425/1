"""Raw Grid, recoloured for NTU CCTF: white page, navy ink, NTU red accent.

Raw Grid's own rule is kept exactly — 3px lines that ARE the layout, cells that meet
without gaps, hard offset shadows, two quiet fills, heavy type — with its black
swapped for CCTF navy, its pink for NTU red and its green for CCTF pale blue.
White stays the page.
"""
from __future__ import annotations

import json
import math
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

# Categorical chart colours. Validated with the dataviz skill's checker against a
# light surface: lightness band, CVD separation, normal-vision floor and contrast all
# pass; teal and brown sit just under the chroma floor, which the legend's direct
# labels and values cover.
CAT = ["#D21540", "#2B4BB8", "#0E8276", "#C97B10", "#8148A8", "#6B5344"]

# Light cell fills, strongest first
FILL_1 = "#CBE0EC"     # CCTF pale blue
FILL_2 = "#EDEFF4"     # light navy tint
FILL_3 = "#F7E9D9"     # warm sand
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
    return (f'<text x="{x}" y="{y}" font-weight="900" '
            f'font-size="{size}" fill="{fill}"{a}>{esc(s)}</text>')


def txt(x, y, s, size=20, fill=NAVY, weight=400, anchor=None, family=FONT, track=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    t = f' letter-spacing="{track}"' if track else ""
    fam = "" if family == FONT else f' font-family="{family}"'
    return (f'<text x="{x}" y="{y}"{fam} font-weight="{weight}" '
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


def header(title_text, n, total=TOTAL):
    w = 18 * total - 6
    return g("header", "0 0 1280 92",
             ttl(MARGIN, 62, title_text, 30),
             progress_chain(1232 - w, 46, n, total),
             hline(MARGIN, 90, 1280 - 2 * MARGIN))


def claim(x, y, s, size=44):
    """The slide's one assertion. No rule under it: red is reserved for the data."""
    return ttl(x, y, s, size)


# ---- bars -------------------------------------------------------------------
def hbar(x, y, w, frac, fill=NAVY, h=26, track=True):
    inner = max(0.0, min(1.0, frac))
    s = cell(x, y, w, h, PAPER, stroke=NAVY) if track else ""
    return s + cell(x + LINE, y + LINE, round((w - 2 * LINE) * inner), h - 2 * LINE, fill)


# ---- doughnut --------------------------------------------------------------
def doughnut(cx, cy, data, r=142, sw=52, colors=None, gap=1.6):
    """Thin ring in the HTML library's style: one arc per slice, a small gap between
    slices. Drawn as paths so every slice converts to an editable PowerPoint shape."""
    cols = colors or [RED, NAVY, NAVY_2, NAVY_3, NAVY_4, NAVY_5]
    total = sum(v for _, v in data)
    ro, ri = r + sw / 2, r - sw / 2
    out, a0 = [], -90.0
    for i, (_, v) in enumerate(data):
        sweep = v / total * 360
        g0, g1 = a0 + gap / 2, a0 + sweep - gap / 2
        if g1 <= g0:                       # a sliver too thin for the gap
            g0, g1 = a0, a0 + max(sweep, 0.35)
        pt = lambda a, rr: (cx + rr * math.cos(math.radians(a)), cy + rr * math.sin(math.radians(a)))
        (x0, y0), (x1, y1) = pt(g0, ro), pt(g1, ro)
        (x2, y2), (x3, y3) = pt(g1, ri), pt(g0, ri)
        big = 1 if g1 - g0 > 180 else 0
        out.append(f'<path d="M{x0:.1f} {y0:.1f} A{ro:.0f} {ro:.0f} 0 {big} 1 {x1:.1f} {y1:.1f} '
                   f'L{x2:.1f} {y2:.1f} A{ri:.0f} {ri:.0f} 0 {big} 0 {x3:.1f} {y3:.1f} Z" '
                   f'fill="{cols[i % len(cols)]}"/>')
        a0 += sweep
    return "".join(out)


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


# ---- regional map + flight arc ---------------------------------------------
def _clip(pts, box):
    """Sutherland-Hodgman clip of a polygon to an axis-aligned rectangle, so land that
    runs past the map panel is cut rather than drawn over the rest of the slide."""
    x0, y0, x1, y1 = box
    edges = ((lambda p: p[0] >= x0, lambda a, b: (x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0]))),
             (lambda p: p[0] <= x1, lambda a, b: (x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0]))),
             (lambda p: p[1] >= y0, lambda a, b: (a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0)),
             (lambda p: p[1] <= y1, lambda a, b: (a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1)))
    for inside, cross in edges:
        if not pts:
            return []
        out, prev = [], pts[-1]
        for cur in pts:
            ci, pi = inside(cur), inside(prev)
            if ci:
                if not pi:
                    out.append(cross(prev, cur))
                out.append(cur)
            elif pi:
                out.append(cross(prev, cur))
            prev = cur
        pts = out
    return pts


def flight_map(x, y, w, h, frm, to, pad_lon=9, pad_lat=(7, 6)):
    """Southeast/East Asia land (Natural Earth, public domain) with the route arc.
    frm/to are (name, lon, lat). Returns (svg, project, A, B)."""
    lons, lats = [frm[1], to[1]], [frm[2], to[2]]
    b = [min(lons) - pad_lon, max(lons) + pad_lon, min(lats) - pad_lat[0], max(lats) + pad_lat[1]]
    k = min(w / (b[1] - b[0]), h / (b[3] - b[2]))
    ox = x + (w - (b[1] - b[0]) * k) / 2
    oy = y + (h - (b[3] - b[2]) * k) / 2

    def pr(lon, lat):
        return ox + (lon - b[0]) * k, oy + (b[3] - lat) * k

    grat = []
    lon = -((-b[0]) // 5) * 5
    while lon <= b[1]:
        gx, _ = pr(lon, 0)
        grat.append(f'<rect x="{gx:.1f}" y="{y:.0f}" width="1" height="{h:.0f}" fill="#E8EBF2"/>')
        lon += 5
    lat = -((-b[2]) // 5) * 5
    while lat <= b[3]:
        _, gy = pr(0, lat)
        grat.append(f'<rect x="{x:.0f}" y="{gy:.1f}" width="{w:.0f}" height="1" fill="#E8EBF2"/>')
        lat += 5

    land, box = [], (x, y, x + w, y + h)
    for poly in geo()["region"]:
        pts = _clip([pr(lo, la) for lo, la in poly], box)
        if len(pts) < 3:
            continue
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        if max(xs) - min(xs) < 3 and max(ys) - min(ys) < 3:
            continue                                   # specks too small to read
        land.append('<path d="M' + "L".join(f"{px:.1f} {py:.1f}" for px, py in pts)
                    + f'Z" fill="#E6EAF1" stroke="#C7CEE4" stroke-width="1"/>')

    A, B = pr(frm[1], frm[2]), pr(to[1], to[2])
    mx, my = (A[0] + B[0]) / 2, (A[1] + B[1]) / 2
    ln = ((B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2) ** 0.5
    nx, ny = -(B[1] - A[1]) / ln, (B[0] - A[0]) / ln
    bend = ln * 0.26 * (1 if nx > 0 else -1)
    arc = (f'<path d="M{A[0]:.1f} {A[1]:.1f} Q{mx + nx * bend:.1f} {my + ny * bend:.1f} '
           f'{B[0]:.1f} {B[1]:.1f}" fill="none" stroke="{RED}" stroke-width="3" stroke-linecap="round"/>')
    return "".join(grat) + "".join(land) + arc, pr, A, B


def lockup(x, y, h=56, centre=True):
    """Official NTU logo (full colour, on white) plus the centre's name, set the way
    the real lockup is built: logo, hairline rule, two lines of type."""
    w = h * 879 / 324
    out = [img("../images/ntu-logo.png", x, y, w, h, "xMidYMid meet")]
    if centre:
        rx = x + w + 22
        out += [vline(rx, y + 2, h - 4, col=NAVY_4, t=2),
                txt(rx + 22, y + h * 0.44, "NTU Centre in Computational", 13, weight=700),
                txt(rx + 22, y + h * 0.44 + 17, "Technologies for Finance", 13, weight=700),
                txt(rx + 22, y + h * 0.44 + 36, "Graduate College", 10, fill=MUTED, weight=700)]
    return "".join(out)


def pin(px, py, name, side="right", col=NAVY):
    dx, anc = (20, "start") if side == "right" else (-20, "end")
    return (f'<circle cx="{px:.1f}" cy="{py:.1f}" r="9" fill="{PAPER}"/>'
            f'<circle cx="{px:.1f}" cy="{py:.1f}" r="6" fill="{col}"/>'
            + txt(px + dx, py + 8, name, 22, weight=900, anchor=anc))


# ---- orchid -----------------------------------------------------------------
# Vanda Miss Joaquim, Singapore's national flower, taken from the component
# library's `botanical` artwork (components/library.js) with the paint that lived
# in library.css written onto the elements, as PPT Master needs.
_ORCHID = """<path fill="none" stroke="{STEM}" stroke-width="2" stroke-linecap="round" d="M60 410C80 280 140 170 260 70"></path><g transform="translate(113.1 245.7) rotate(-122.0)"><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(0)" d="M0 0C11.5 -16.1 39.1 -16.1 46 0C39.1 16.1 11.5 16.1 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(72)" d="M0 0C11.5 -16.1 39.1 -16.1 46 0C39.1 16.1 11.5 16.1 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(144)" d="M0 0C11.5 -16.1 39.1 -16.1 46 0C39.1 16.1 11.5 16.1 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(216)" d="M0 0C11.5 -16.1 39.1 -16.1 46 0C39.1 16.1 11.5 16.1 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(288)" d="M0 0C11.5 -16.1 39.1 -16.1 46 0C39.1 16.1 11.5 16.1 0 0Z"></path><path fill="{LIP}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(108)" d="M0 0C18.4 -27.6 57.5 -32.2 50.6 0C57.5 32.2 18.4 27.6 0 0Z"></path><circle fill="{INK}" r="5"></circle></g><g transform="translate(167.7 163.0) rotate(-111.0)"><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(0)" d="M0 0C9.8 -13.7 33.2 -13.7 39.1 0C33.2 13.7 9.8 13.7 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(72)" d="M0 0C9.8 -13.7 33.2 -13.7 39.1 0C33.2 13.7 9.8 13.7 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(144)" d="M0 0C9.8 -13.7 33.2 -13.7 39.1 0C33.2 13.7 9.8 13.7 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(216)" d="M0 0C9.8 -13.7 33.2 -13.7 39.1 0C33.2 13.7 9.8 13.7 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(288)" d="M0 0C9.8 -13.7 33.2 -13.7 39.1 0C33.2 13.7 9.8 13.7 0 0Z"></path><path fill="{LIP}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(108)" d="M0 0C15.64 -23.46 48.9 -27.37 43.0 0C48.9 27.37 15.64 23.46 0 0Z"></path><circle fill="{INK}" r="5"></circle></g><g transform="translate(242.4 85.1) rotate(-101.4)"><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(0)" d="M0 0C8.0 -11.3 27.4 -11.3 32.2 0C27.4 11.3 8.0 11.3 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(72)" d="M0 0C8.0 -11.3 27.4 -11.3 32.2 0C27.4 11.3 8.0 11.3 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(144)" d="M0 0C8.0 -11.3 27.4 -11.3 32.2 0C27.4 11.3 8.0 11.3 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(216)" d="M0 0C8.0 -11.3 27.4 -11.3 32.2 0C27.4 11.3 8.0 11.3 0 0Z"></path><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(288)" d="M0 0C8.0 -11.3 27.4 -11.3 32.2 0C27.4 11.3 8.0 11.3 0 0Z"></path><path fill="{LIP}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" transform="rotate(108)" d="M0 0C12.9 -19.3 40.2 -22.5 35.42 0C40.2 22.5 12.9 19.3 0 0Z"></path><circle fill="{INK}" r="5"></circle></g><g transform="translate(69.0 364.0) rotate(-150.0)"><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" d="M0 0C36 -14 84 -14 120 0C84 14 36 14 0 0Z"></path><path fill="none" stroke="{RIB}" stroke-width="0.8" d="M9.6 0L102 0"></path></g><g transform="translate(79.2 327.0) rotate(-30.0)"><path fill="{PETAL}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round" d="M0 0C36 -14 84 -14 120 0C84 14 36 14 0 0Z"></path><path fill="none" stroke="{RIB}" stroke-width="0.8" d="M9.6 0L102 0"></path></g>"""


def orchid(x, y, h, ink=NAVY_4, petal=PAPER, lip=None, stem=None, rib=None):
    """Fine line-art orchid spray. Native box is 340x420; h sets the drawn height."""
    k = h / 420.0
    body = (_ORCHID.replace("{INK}", ink).replace("{PETAL}", petal)
            .replace("{LIP}", lip or PALE).replace("{STEM}", stem or ink)
            .replace("{RIB}", rib or NAVY_5))
    return f'<g transform="translate({x} {y}) scale({k:.4f})">{body}</g>'


# ---- grouped column chart ---------------------------------------------------
def vbars(x, y, w, h, groups, series, scale, pad_top=28):
    """Grouped vertical bars: `groups` are the categories along the baseline,
    `series` is [(name, colour, [value per group]), ...]. Values are drawn against
    `scale` (the top of the axis) and labelled above each column."""
    out, base = [], y + h
    for t in range(0, int(scale) + 1, 10):
        gy = base - h * t / scale
        out.append(hline(x, gy, w, col=NAVY_5 if t else NAVY, t=2 if t else 3))
        out.append(txt(x - 14, gy + 6, f"{t}%", 15, fill=MUTED, anchor="end", family=MONO))
    pitch = w / len(groups)
    bw = pitch * 0.22
    gap = 10
    span = len(series) * bw + (len(series) - 1) * gap
    for gi, name in enumerate(groups):
        cx = x + pitch * (gi + 0.5)
        for si, (_, col, vals) in enumerate(series):
            v = vals[gi]
            bh = max((h - pad_top) * v / scale, 3)
            bx = cx - span / 2 + si * (bw + gap)
            out.append(cell(bx, base - bh, bw, bh, col))
            out.append(txt(bx + bw / 2, base - bh - 14, f"{v}%", 21, weight=900,
                           fill=col, anchor="middle"))
        out.append(txt(cx, base + 34, name, 21, weight=700, anchor="middle"))
    return "".join(out)


def legend_row(x, y, series, gap=190):
    out = []
    for i, (name, col, _) in enumerate(series):
        lx = x + i * gap
        out += [cell(lx, y - 14, 18, 18, col), txt(lx + 28, y, name, 19, weight=700)]
    return "".join(out)
