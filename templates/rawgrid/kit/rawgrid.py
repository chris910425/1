"""Raw Grid kit for PPT Master: SVG fragments for 1280x720 slides.

Every function returns an SVG string that follows PPT Master's authoring rules
(no classes, no <style>, solid #RRGGBB paint, explicit geometry), so the executor
can paste it into a page. Root groups: wrap returned fragments in
<g id="..." data-pptx-bounds="x y w h"> yourself, or use the *_group helpers.

Look (Raw Grid): white page, 3px black lines that ARE the layout, cells that meet
without gaps, hard black offset shadows (6px / 4px, never blurred), two pastel
fills (pink, green) + light grey, heavy uppercase type, arrows (→), bars in
bordered tracks. Library elements (chain, Merkle tree, network, tx steps,
doughnut, terminal, text effects, icons) are redrawn in that language, each in a
`full` (diagram) and, where useful, a `faint` (background texture) strength.
"""
from __future__ import annotations

import json
import math
import random
from xml.sax.saxutils import escape as _esc

# ---- tokens ----------------------------------------------------------------
INK = "#0A0A0A"
PAPER = "#FFFFFF"
PINK = "#F2D4CF"
GREEN = "#E5EDD6"
GRAY = "#F5F5F5"
DARK = "#333333"
MUTED = "#6B6B6B"
FAINT = "#D6D6D2"          # background-texture lines on white
FAINT_PINK = "#E2B8B0"     # background-texture lines on pink
FAINT_GREEN = "#C9D6B4"    # background-texture lines on green

TITLE = "Segoe UI Black, Noto Sans TC Black"   # display: heavy grotesk + heavy 黑體
BODY = "Segoe UI, Microsoft JhengHei"          # text
MONO = "Consolas, Microsoft JhengHei"          # hashes, terminal
LINE = 3                                        # the grid line
SHADOW, SHADOW_SM = 6, 4


def esc(s) -> str:
    return _esc(str(s))


def is_cjk(c: str) -> bool:
    return ord(c) >= 0x2E80


def text_w(text: str, size: float, heavy: bool = True) -> float:
    """Rough advance width (px) for sizing zones. CJK = 1em; Latin heavy caps ~0.68em."""
    w = 0.0
    for c in str(text):
        if is_cjk(c):
            w += size
        elif c == " ":
            w += size * 0.3
        elif c.isdigit():
            w += size * (0.62 if heavy else 0.56)
        elif c.isupper():
            w += size * (0.70 if heavy else 0.62)
        else:
            w += size * (0.60 if heavy else 0.52)
    return w


def caps(text: str) -> str:
    """Raw Grid sets Latin in uppercase; Chinese is left as written."""
    return "".join(c.upper() if c.isascii() else c for c in str(text))


def track(text: str, size: float) -> str:
    """Letter-spacing attr for uppercase Latin labels only (never tracks Chinese)."""
    return "" if any(is_cjk(c) for c in str(text)) else f' letter-spacing="{size * 0.08:.1f}"'


# ---- page structure ----------------------------------------------------------
def page(role: str, body: str, bg: str = PAPER, defs: str = "") -> str:
    """Flat PPT Master page (1280x720, 繁體)."""
    d = f"  <defs>\n{defs}  </defs>\n" if defs else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="zh-Hant" '
            f'data-pptx-page-role="{role}" font-family="{BODY}">\n{d}'
            f'  <rect id="bg" data-pptx-role="background" x="0" y="0" width="1280" height="720" fill="{bg}"/>\n'
            f'{body}</svg>\n')


def hline(x, y, w, col=INK, t=LINE):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{t}" fill="{col}"/>'


def vline(x, y, h, col=INK, t=LINE):
    return f'<rect x="{x}" y="{y}" width="{t}" height="{h}" fill="{col}"/>'


def cell(x, y, w, h, fill=PAPER):
    """A filled grid cell (lines are drawn separately so cells can meet without gaps)."""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'


def card(x, y, w, h, fill=PAPER, shadow=SHADOW, border=LINE):
    """Bordered box with a hard black offset shadow."""
    s = f'<rect x="{x + shadow}" y="{y + shadow}" width="{w}" height="{h}" fill="{INK}"/>' if shadow else ""
    return s + f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{INK}" stroke-width="{border}"/>'


def title(x, y, text, size=56, fill=INK, anchor=None, upper=True):
    a = f' text-anchor="{anchor}"' if anchor else ""
    t = caps(text) if upper else text
    ls = "" if any(is_cjk(c) for c in t) else f' letter-spacing="{-size * 0.02:.1f}"'
    return f'<text x="{x}" y="{y}" font-family="{TITLE}" font-size="{size}" fill="{fill}"{ls}{a}>{esc(t)}</text>'


def text(x, y, s, size=20, fill=INK, bold=False, anchor=None, family=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    f = f' font-family="{family}"' if family else ""
    b = ' font-weight="bold"' if bold else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}"{b}{f}{a}>{esc(s)}</text>'


def para(x, y, lines, size=20, fill=INK, lead=1.55, bold=False):
    """One editable paragraph with positioned line breaks."""
    b = ' font-weight="bold"' if bold else ""
    first, rest = lines[0], lines[1:]
    tsp = "".join(f'<tspan x="{x}" dy="{size * lead:.0f}">{esc(l)}</tspan>' for l in rest)
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}"{b}>{esc(first)}{tsp}</text>'


def label(x, y, s, size=14, inverse=True, anchor="start"):
    """Raw Grid label: black box, white uppercase text (or outlined when inverse=False)."""
    t = caps(s)
    w = text_w(t, size, heavy=False) + (len(t) * size * 0.08 if not any(is_cjk(c) for c in t) else 0) + 28
    x0 = x - w if anchor == "end" else x
    bg = f'<rect x="{x0:.0f}" y="{y}" width="{w:.0f}" height="{size + 16}" fill="{INK if inverse else PAPER}"' + ("" if inverse else f' stroke="{INK}" stroke-width="2"') + "/>"
    return bg + (f'<text x="{x0 + 14:.0f}" y="{y + size + 4}" font-size="{size}" font-weight="bold" '
                 f'fill="{PAPER if inverse else INK}"{track(t, size)}>{esc(t)}</text>')


def arrow_item(x, y, s, size=22, bold=True):
    """'→ ITEM' list row text (Raw Grid's arrow prefix)."""
    return f'<text x="{x}" y="{y}" font-size="{size}"{" font-weight=\"bold\"" if bold else ""} fill="{INK}">→ {esc(caps(s))}</text>'


def bar(x, y, w, frac, fill=PINK, h=32, value=None):
    """Bordered track with a pastel fill; optional value label at the end of the fill."""
    fw = max(0, min(1, frac)) * (w - 6)
    v = (f'<text x="{x + 12}" y="{y + h / 2 + 6:.0f}" font-size="14" font-weight="bold" fill="{INK}">{esc(value)}</text>' if value else "")
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{PAPER}" stroke="{INK}" stroke-width="{LINE}"/>'
            f'<rect x="{x + 3}" y="{y + 3}" width="{fw:.0f}" height="{h - 6}" fill="{fill}"/>' + v)


def big_number(x, y, value, size=96, unit=None, fill=INK):
    u = (f'<text x="{x + text_w(value, size) + 10:.0f}" y="{y}" font-family="{TITLE}" font-size="{size * 0.32:.0f}" '
         f'fill="{fill}">{esc(unit)}</text>' if unit else "")
    return title(x, y, value, size, fill=fill) + u


def ghost_number(x, y, n, size=120, fill="#C8C8C8"):
    """Large low-contrast numeral used as wallpaper behind a step or card."""
    return f'<text x="{x}" y="{y}" font-family="{TITLE}" font-size="{size}" fill="{fill}">{esc(n)}</text>'


def header(title_text, n, total, right=None):
    """Top bar: title left, block-progress chain right (one block per slide), 3px rule."""
    chain = progress_chain(1240, 30, n, total, anchor="end")
    r = f'<text x="{1240 - 18 * total - 16}" y="47" font-size="14" font-weight="bold" fill="{MUTED}" text-anchor="end" letter-spacing="1.1">{esc(caps(right))}</text>' if right else ""
    return (f'  <g id="header" data-pptx-bounds="0 0 1280 75">\n    {title(40, 50, title_text, 30)}\n    {chain}{r}\n'
            f'    {hline(0, 72, 1280)}\n  </g>\n')


# ---- chain of blocks ------------------------------------------------------------
def fake_hash(seed: int, n: int = 4) -> str:
    x, out = (seed * 2654435761) & 0xFFFFFFFF, ""
    for _ in range(n * 2):
        x = (x * 1103515245 + 12345) & 0xFFFFFFFF
        out += "0123456789abcdef"[(x >> 16) & 15]
    return "0x" + out[:n] + "…" + out[n:]


def progress_chain(x, y, n, total, size=12, gap=6, anchor="start"):
    """Tiny chain as a slide-progress bar: past = grey, current = black, future = outline."""
    w = total * size + (total - 1) * gap
    x0 = x - w if anchor == "end" else x
    s = []
    for i in range(total):
        bx = x0 + i * (size + gap)
        fill = INK if i == n - 1 else (FAINT if i < n - 1 else PAPER)
        s.append(f'<rect x="{bx}" y="{y}" width="{size}" height="{size}" fill="{fill}" stroke="{INK}" stroke-width="2"/>')
        if i < total - 1:
            s.append(f'<rect x="{bx + size}" y="{y + size / 2 - 1}" width="{gap}" height="2" fill="{INK}"/>')
    return "".join(s)


def chain(x, y, n=4, start=1024, labels=None, bw=230, bh=170, gap=60, accent=PINK, faint=False, lines=FAINT):
    """Chain of blocks. full: bordered blocks with #height strip, prev/hash rows, hard shadows,
    thick links; the newest block is pink. faint: outline-only texture for backgrounds."""
    s = []
    for i in range(n):
        bx = x + i * (bw + gap)
        if faint:
            s.append(f'<rect x="{bx}" y="{y}" width="{bw}" height="{bh}" fill="none" stroke="{lines}" stroke-width="2"/>'
                     f'<rect x="{bx}" y="{y}" width="{bw}" height="{bh * 0.22:.0f}" fill="{lines}"/>')
            if i:
                s.append(f'<rect x="{bx - gap}" y="{y + bh / 2 - 2:.0f}" width="{gap}" height="4" fill="{lines}"/>')
            continue
        last = i == n - 1
        lab = (labels[i] if labels and i < len(labels) else f"#{start + i}")
        if i:
            s.append(f'<rect x="{bx - gap}" y="{y + bh / 2 - 4:.0f}" width="{gap}" height="8" fill="{INK}"/>'
                     f'<rect x="{bx - gap / 2 - 9:.0f}" y="{y + bh / 2 - 13:.0f}" width="18" height="26" fill="{PAPER}" stroke="{INK}" stroke-width="3"/>')
        s.append(card(bx, y, bw, bh, fill=accent if last else PAPER))
        s.append(f'<rect x="{bx + 1.5}" y="{y + 1.5}" width="{bw - 3}" height="42" fill="{INK}"/>'
                 f'<text x="{bx + 16}" y="{y + 31}" font-family="{TITLE}" font-size="22" fill="{PAPER}">{esc(lab)}</text>')
        rows = [("PREV", fake_hash(start + i - 1) if i else "0x0000…0000"), ("HASH", fake_hash(start + i))]
        for k, (key, val) in enumerate(rows):
            ry = y + 84 + k * 54
            s.append(f'<text x="{bx + 16}" y="{ry}" font-size="14" font-weight="bold" fill="{MUTED}" letter-spacing="1">{key}</text>'
                     f'<text x="{bx + 16}" y="{ry + 26}" font-family="{MONO}" font-size="21" fill="{INK}">{esc(val)}</text>')
    return "".join(s)


# ---- Merkle tree ------------------------------------------------------------------
def merkle(x, y, w, h, leaves=("Tx1", "Tx2", "Tx3", "Tx4", "Tx5", "Tx6", "Tx7", "Tx8"), proof=None,
           faint=False, lines=FAINT, bh=52):
    """Merkle tree with orthogonal 3px links. Root is pink. `proof` = leaf index whose
    authentication path (siblings) is filled green, the leaf itself pink-outlined."""
    levels = [list(leaves)]
    while len(levels[-1]) > 1:
        prev = levels[-1]
        levels.append(["ROOT" if len(prev) == 2 else f"H{len(levels)}·{i // 2 + 1}" for i in range(0, len(prev), 2)])
    L = len(levels)
    bw = min(110, w / len(leaves) - 18)
    yy = lambda l: y + h - bh - l * ((h - bh) / (L - 1))
    xx = lambda l, i: x + (w / len(levels[l])) * (i + 0.5)
    path_nodes, sib_nodes = set(), set()
    if proof is not None:
        idx = proof
        for l in range(L):
            path_nodes.add((l, idx))
            if l < L - 1:
                sib_nodes.add((l, idx ^ 1))
            idx //= 2
    col = lines if faint else INK
    sw = 2 if faint else LINE
    s = []
    for l in range(1, L):
        for i in range(len(levels[l])):
            for c in (2 * i, 2 * i + 1):
                x1, y1, x2, y2 = xx(l - 1, c), yy(l - 1), xx(l, i), yy(l) + bh
                my = (y1 + y2) / 2
                s.append(f'<path d="M{x1:.1f} {y1:.1f} V{my:.1f} H{x2:.1f} V{y2:.1f}" fill="none" stroke="{col}" stroke-width="{sw}"/>')
    for l, lv in enumerate(levels):
        for i, name in enumerate(lv):
            root = l == L - 1
            nw = 190 if root else bw
            nx, ny = xx(l, i) - nw / 2, yy(l)
            if faint:
                s.append(f'<rect x="{nx:.1f}" y="{ny:.1f}" width="{nw:.1f}" height="{bh}" fill="{PAPER if lines == FAINT else "none"}" stroke="{lines}" stroke-width="2"/>')
                continue
            fill = PINK if root else (GREEN if (l, i) in sib_nodes else PAPER)
            shadow = SHADOW_SM if root or (l, i) in path_nodes or (l, i) in sib_nodes else 0
            s.append(card(nx, ny, nw, bh, fill=fill, shadow=shadow))
            if (l, i) in path_nodes and not root:
                s.append(f'<rect x="{nx + 5:.1f}" y="{ny + 5:.1f}" width="{nw - 10:.1f}" height="{bh - 10}" fill="none" stroke="{INK}" stroke-width="2" stroke-dasharray="4,3"/>')
            s.append(f'<text x="{xx(l, i):.1f}" y="{ny + (bh / 2 + 7 if l == 0 else 22):.1f}" text-anchor="middle" font-size="{20 if root else 17}" font-weight="bold" fill="{INK}">{esc(name)}</text>')
            if l > 0:
                s.append(f'<text x="{xx(l, i):.1f}" y="{ny + 42:.1f}" text-anchor="middle" font-family="{MONO}" font-size="14" fill="{MUTED}">{esc(fake_hash(l * 31 + i, 3))}</text>')
    return "".join(s)


# ---- network propagation -----------------------------------------------------------------
def network_layout(n=16, w=880, h=440, seed=0):
    pts = []
    for i in range(n):
        r = math.sqrt((i + 0.5) / n)
        a = i * 2.399963 + seed
        pts.append((w / 2 + math.cos(a) * r * (w / 2 - 30), h / 2 + math.sin(a) * r * (h / 2 - 26)))
    d2 = lambda a, b: (pts[a][0] - pts[b][0]) ** 2 + (pts[a][1] - pts[b][1]) ** 2
    edges = set()
    for i in range(n):
        for j in sorted((j for j in range(n) if j != i), key=lambda j: d2(i, j))[:3]:
            edges.add((min(i, j), max(i, j)))
    adj = {i: [] for i in range(n)}
    for a, b in edges:
        adj[a].append(b); adj[b].append(a)
    origin, hop, q = n - 1, {n - 1: 0}, [n - 1]
    while q:
        u = q.pop(0)
        for v in adj[u]:
            if v not in hop:
                hop[v] = hop[u] + 1; q.append(v)
    return pts, sorted(edges), hop, origin


def network(x, y, w=880, h=440, n=16, wave=None, faint=False, lines=FAINT, r=13, seed=0, ids=None):
    """Gossip network. wave=None draws everything reached (final state); wave=k shows the
    message after k hops: reached nodes green, origin pink, hot links black 4px, others grey.
    Use the same n/seed on consecutive slides with wave 0,1,2… and a Morph transition.
    ids: prefix to name nodes (n-<prefix>-<i>) so PowerPoint Morph can pair them."""
    pts, edges, hop, origin = network_layout(n, w, h, seed)
    k = max(hop.values()) if wave is None else wave
    s = []
    for a, b in edges:
        (x1, y1), (x2, y2) = pts[a], pts[b]
        hot = not faint and hop.get(a, 99) <= k and hop.get(b, 99) <= k and abs(hop.get(a, 0) - hop.get(b, 0)) == 1
        col, sw = (lines, 2) if faint else ((INK, 4) if hot else ("#BDBDBD", 2))
        s.append(f'<line x1="{x + x1:.1f}" y1="{y + y1:.1f}" x2="{x + x2:.1f}" y2="{y + y2:.1f}" stroke="{col}" stroke-width="{sw}"/>')
    for i, (px, py) in enumerate(pts):
        if faint:
            s.append(f'<circle cx="{x + px:.1f}" cy="{y + py:.1f}" r="{r - 3}" fill="{PAPER if lines == FAINT else "none"}" stroke="{lines}" stroke-width="2"/>')
            continue
        reached = hop.get(i, 99) <= k
        fill = PINK if i == origin else (GREEN if reached else PAPER)
        rr = r + 5 if i == origin else r
        s.append(f'<circle cx="{x + px + 3:.1f}" cy="{y + py + 3:.1f}" r="{rr}" fill="{INK}"/>'
                 f'<circle cx="{x + px:.1f}" cy="{y + py:.1f}" r="{rr}" fill="{fill}" stroke="{INK}" stroke-width="3"/>')
    return "".join(s), max(hop.values())


# ---- transaction steps ---------------------------------------------------------------------
def tx_steps(x, y, w, h, steps, current=None, fills=(GREEN, PINK)):
    """Raw Grid process: equal columns split by 3px lines, ghost numbers, caps title, caption,
    square joints on the lines. Columns up to `current` are filled (done green, current pink)."""
    n, cw = len(steps), w / len(steps)
    s = [hline(x, y, w), hline(x, y + h - LINE, w)]
    for i, (t, cap) in enumerate(steps):
        cx = x + i * cw
        if current is not None and i <= current:
            s.append(cell(cx + (LINE if i else 0), y + LINE, cw - (LINE if i else 0), h - 2 * LINE, fills[1] if i == current else fills[0]))
        s.append(ghost_number(cx + 24, y + 110, f"{i + 1:02d}", 96, fill="#BDBDBD" if not (current is not None and i <= current) else "#9C9C9C"))
        s.append(title(cx + 24, y + 170, t, 30))
        s.append(para(cx + 24, y + 212, cap.split("\n"), 18, fill=DARK, lead=1.5))
        if i:
            s.append(vline(cx, y, h) + f'<rect x="{cx - 9:.0f}" y="{y + 18}" width="21" height="21" fill="{INK}"/>'
                     f'<text x="{cx + 1.5:.0f}" y="{y + 34}" text-anchor="middle" font-size="15" font-weight="bold" fill="{PAPER}">→</text>')
    return "".join(s)


# ---- doughnut (native PowerPoint chart) -------------------------------------------------------
def doughnut(key, cx, cy, data, ro=190, ri=110, colors=(INK, PINK, GREEN, "#BDBDBD", DARK)):
    """Doughnut chart: SVG fallback (3px black seams) + PPT Master native-chart marker.
    data = [(label, value), ...]. Export with --native-charts-and-tables to get an editable
    PowerPoint chart; run stamp_native_fallbacks.py --write after editing."""
    total = sum(v for _, v in data)
    arcs, a0 = [], -90.0
    for i, (_, v) in enumerate(data):
        a1 = a0 + v / total * 360
        p = lambda a, r: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
        (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p(a0, ro), p(a1, ro), p(a1, ri), p(a0, ri)
        large = 1 if a1 - a0 > 180 else 0
        arcs.append(f'<path d="M{x0:.1f} {y0:.1f} A{ro} {ro} 0 {large} 1 {x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} '
                    f'A{ri} {ri} 0 {large} 0 {x3:.1f} {y3:.1f} Z" fill="{colors[i % len(colors)]}" stroke="{INK}" stroke-width="3"/>')
        a0 = a1
    meta = {"x": cx - ro, "y": cy - ro, "width": 2 * ro, "height": 2 * ro, "name": key, "type": "doughnut",
            "categories": [l for l, _ in data], "series": [{"name": key, "values": [v for _, v in data]}],
            "show_legend": False, "style": {"colors": [colors[i % len(colors)] for i in range(len(data))]}}
    return (f'<g id="{key}" data-pptx-replace-with="chart"><metadata type="application/json">{json.dumps(meta, ensure_ascii=False)}</metadata>'
            + "".join(arcs) + "</g>")


def legend_rows(x, y, w, data, row_h=96, colors=(INK, PINK, GREEN, "#BDBDBD", DARK), unit="%"):
    """Raw Grid legend: one bordered row per slice (swatch, name, big value, bar)."""
    total = sum(v for _, v in data)
    s = []
    for i, (name, v) in enumerate(data):
        ry = y + i * row_h
        s.append(hline(x, ry + row_h - LINE, w))
        s.append(f'<rect x="{x + 24}" y="{ry + 24}" width="26" height="26" fill="{colors[i % len(colors)]}" stroke="{INK}" stroke-width="3"/>')
        s.append(text(x + 66, ry + 46, name, 22, bold=True))
        s.append(title(x + w - 24, ry + 52, f"{v}{unit}", 40, anchor="end"))
        s.append(bar(x + 24, ry + 62, w - 220, v / total, fill=colors[i % len(colors)] if colors[i % len(colors)] != INK else DARK, h=18))
    return "".join(s)


# ---- terminal ---------------------------------------------------------------------------------
def terminal(x, y, w, h, lines, title_text="TERMINAL", size=20):
    """Raw Grid terminal: bordered black cell, white label strip, mono lines.
    lines = [("$", "cmd"), ("", "output"), ("!", "highlighted output")]."""
    s = [card(x, y, w, h, fill=INK)]
    s.append(f'<rect x="{x + 1.5}" y="{y + 1.5}" width="{w - 3}" height="34" fill="{PAPER}"/>{hline(x, y + 35, w)}'
             f'<text x="{x + 16}" y="{y + 24}" font-size="14" font-weight="bold" fill="{INK}" letter-spacing="1.1">{esc(caps(title_text))}</text>')
    for i in range(3):
        s.append(f'<rect x="{x + w - 30 - i * 22}" y="{y + 11}" width="14" height="14" fill="{PAPER}" stroke="{INK}" stroke-width="2"/>')
    for i, (p, t) in enumerate(lines):
        ly = y + 76 + i * size * 1.7
        col = PINK if p == "!" else (PAPER if p == "$" else "#BDBDBD")
        pre = "$ " if p == "$" else ""
        s.append(f'<text x="{x + 24}" y="{ly:.0f}" font-family="{MONO}" font-size="{size}" fill="{col}" xml:space="preserve">{esc(pre + t)}</text>')
    return "".join(s)


# ---- text effects (static versions of the library's fx) -------------------------------------------
def _rough(points, seed, jitter=2.5, passes=2, col=INK, sw=3):
    """Hand-drawn polyline: two slightly different passes, like Rough Notation."""
    rnd = random.Random(seed)
    out = []
    for _ in range(passes):
        d = "M" + " L".join(f"{px + rnd.uniform(-jitter, jitter):.1f} {py + rnd.uniform(-jitter, jitter):.1f}" for px, py in points)
        out.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>')
    return "".join(out)


def fx_highlight(x, y, w, size, col=PINK, seed=1):
    """Marker highlight behind a run of text (draw BEFORE the text). y = text baseline."""
    rnd = random.Random(seed)
    top, bot = y - size * 0.78, y + size * 0.18
    pts = [(x - 6, top + rnd.uniform(-3, 3)), (x + w + 6, top + rnd.uniform(-3, 3)), (x + w + 8, bot + rnd.uniform(-3, 3)), (x - 4, bot + rnd.uniform(-3, 3))]
    return f'<polygon points="{" ".join(f"{a:.1f},{b:.1f}" for a, b in pts)}" fill="{col}"/>'


def fx_underline(x, y, w, col=INK, seed=2, sw=4):
    """Hand-drawn underline under a baseline y."""
    return _rough([(x - 2, y + 10), (x + w * 0.5, y + 13), (x + w + 4, y + 9)], seed, col=col, sw=sw)


def fx_circle(cx, cy, w, h, col=INK, seed=3, sw=3):
    """Hand-drawn loop around a word (centre + size of the loop)."""
    pts = [(cx + (w / 2) * math.cos(t) * (1 + 0.04 * math.sin(3 * t)), cy + (h / 2) * math.sin(t)) for t in [i * 2 * math.pi / 28 for i in range(31)]]
    return _rough(pts, seed, jitter=2, passes=2, col=col, sw=sw)


def fx_box(x, y, w, h, col=INK, seed=4, sw=3):
    return _rough([(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)], seed, col=col, sw=sw)


def fx_strike(x, y, w, size, col=INK, seed=5, sw=4):
    """Hand-drawn strike-through across text on baseline y."""
    my = y - size * 0.32
    return _rough([(x - 4, my + 2), (x + w + 4, my - 2)], seed, col=col, sw=sw)


def fx_bracket(x, y, h, col=INK, seed=6, sw=4, side="left"):
    d = 14 if side == "left" else -14
    return _rough([(x + d, y), (x, y), (x, y + h), (x + d, y + h)], seed, col=col, sw=sw)


def fx_hash(x, y, word, size=96, digest_size=20):
    """'Hash reveal' end state: the word, with its sha256-style digest below."""
    return (title(x, y, word, size, upper=False) +
            f'<text x="{x + 4}" y="{y + digest_size + 26}" font-family="{MONO}" font-size="{digest_size}" fill="{MUTED}">sha256 → '
            f'<tspan font-weight="bold" fill="{INK}">{esc(fake_hash(len(word) * 97, 10))}</tspan></text>')


def fx_type(x, y, s, size=40, family=MONO):
    """'Typed' end state: text followed by a block caret."""
    w = len(s) * size * 0.6 if family == MONO else text_w(s, size, heavy=False)
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" fill="{INK}">{esc(s)}</text>'
            f'<rect x="{x + w + 8:.0f}" y="{y - size * 0.8:.0f}" width="{size * 0.5:.0f}" height="{size * 0.95:.0f}" fill="{INK}"/>')


# ---- icons ------------------------------------------------------------------------------------------
def icon(name, x, y, size=48, color=INK, lib="fsc-line", stroke_width=None):
    """Library icon via PPT Master's icon pipeline (run icon_sync.py for fsc-line/<name> first).
    Characters (alice, bob, eve, trent, mallory) live in lib='fsc-char' and keep their colours."""
    sw = f' stroke-width="{stroke_width}"' if stroke_width else ""
    return f'<use data-icon="{lib}/{name}" x="{x}" y="{y}" width="{size}" height="{size if lib == "fsc-line" else size * 4 / 3:.0f}" fill="{color}"{sw}/>'
