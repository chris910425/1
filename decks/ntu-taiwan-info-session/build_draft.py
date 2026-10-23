"""Drafts for the NTU Taiwan info-session deck.

Raw Grid, recoloured: white is the page, navy #0A1138 replaces Raw Grid's black for
every line, text and hard shadow, NTU red is the one accent, CCTF pale blue is the
quiet fill. The cover is the only photo page and the photo keeps its own colours.

python3 decks/ntu-taiwan-info-session/build_draft.py   -> draft-cover/*.svg
Render: bash .claude/skills/slide-taste/scripts/shoot_svg.sh decks/ntu-taiwan-info-session/draft-cover <out>
"""
import pathlib
from xml.sax.saxutils import escape as esc

OUT = pathlib.Path(__file__).parent / "draft-cover"

# --- tokens ------------------------------------------------------------------
PAPER = "#FFFFFF"      # the page: white, as in Raw Grid
NAVY = "#0A1138"       # Raw Grid's ink, in CCTF navy: lines, text, hard shadows
NAVY_2 = "#2B3A77"
NAVY_3 = "#5A6AA8"
NAVY_4 = "#93A0C9"
NAVY_5 = "#C7CEE4"
RED = "#D21540"        # the accent: one thing per page
PALE = "#CBE0EC"       # CCTF pale blue: quiet fill, replaces Raw Grid's green
MUTED = "#6B6B6B"
LINE = 3
SHADOW = 6

FONT = "Noto Sans TC"
MONO = "Consolas, Noto Sans TC"


def ttl(x, y, s, size=66, fill=NAVY, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-weight="900" '
            f'font-size="{size}" fill="{fill}"{a}>{esc(s)}</text>')


def txt(x, y, s, size=20, fill=NAVY, weight=400, anchor=None, family=FONT, track=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    t = f' letter-spacing="{track}"' if track else ""
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-weight="{weight}" '
            f'font-size="{size}" fill="{fill}"{a}{t}>{esc(s)}</text>')


def hline(x, y, w, col=NAVY, t=LINE):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{t}" fill="{col}"/>'


def vline(x, y, h, col=NAVY, t=LINE):
    return f'<rect x="{x}" y="{y}" width="{t}" height="{h}" fill="{col}"/>'


def card(x, y, w, h, fill=PAPER, shadow=SHADOW):
    s = f'<rect x="{x + shadow}" y="{y + shadow}" width="{w}" height="{h}" fill="{NAVY}"/>' if shadow else ""
    return (s + f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" '
                f'stroke="{NAVY}" stroke-width="{LINE}"/>')


def img(href, x, y, w, h, fit="xMidYMid slice"):
    return (f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" '
            f'preserveAspectRatio="{fit}"/>')


def g(gid, bounds, *parts, role=None):
    r = f' data-pptx-role="{role}"' if role else ""
    return (f'  <g id="{gid}" data-pptx-bounds="{bounds}"{r}>\n    '
            + "\n    ".join(p for p in parts if p) + "\n  </g>\n")


def page(role, body, bg=PAPER, defs=""):
    d = f"  <defs>\n{defs}  </defs>\n" if defs else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="zh-Hant" '
            f'data-pptx-page-role="{role}" font-family="{FONT}">\n{d}'
            f'  <rect id="bg" data-pptx-role="background" x="0" y="0" width="1280" height="720" fill="{bg}"/>\n'
            f'{body}</svg>\n')


def progress_chain(x, y, n, total, size=12, gap=6):
    """Raw Grid's block-progress chain: one small block per slide, the current one solid."""
    return "".join(
        f'<rect x="{x + i * (size + gap)}" y="{y}" width="{size}" height="{size}" '
        f'fill="{NAVY if i == n - 1 else PAPER}" stroke="{NAVY}" stroke-width="2"/>'
        for i in range(total))


def header(title_text, n, total, right=None):
    w = (12 + 6) * total - 6
    return g("header", f"0 0 1280 92",
             ttl(48, 62, title_text, 30),
             txt(1232 - w - 24, 62, right, 13, fill=MUTED, weight=700, anchor="end", track=1.2) if right else "",
             progress_chain(1232 - w, 46, n, total),
             hline(48, 90, 1184))


# =============================================================================
# 01  cover: white frame, the Hive in its own colours, title on a white card
# =============================================================================
EVENT = "NTU CCTF 台灣招生說明會"
WHO = "（你的名字）・ MSBT 2026 入學"
WHEN = "2026 年 ・ 台北"

cover = page("cover",
    g("topband", "0 0 1280 95",
      img("../images/ntu-cctf-lockup-navy.png", 48, 22, 320, 52, "xMidYMid meet"),
      txt(1232, 57, EVENT, 19, fill=NAVY, weight=700, anchor="end"),
      hline(0, 92, 1280)) +
    g("photo", "0 95 1280 530",
      img("../images/hive-cover.jpg", 0, 95, 1280, 530), role="background") +
    g("title", "48 168 654 314",
      card(48, 168, 648, 308),
      ttl(88, 288, "來 NTU 之前，", 72),
      ttl(88, 376, "該知道的事", 72),
      hline(92, 414, 96, col=RED, t=5),
      txt(92, 456, "生活開銷 ・ 課程 ・ 還有我的真心話", 24, fill=MUTED)) +
    g("footband", "0 625 1280 95",
      hline(0, 625, 1280),
      txt(48, 684, WHO, 20, fill=NAVY, weight=700),
      txt(1232, 684, WHEN, 20, fill=MUTED, anchor="end")))

# =============================================================================
# 02  content: the doughnut, in the HTML library's style, on the white page
# =============================================================================
SPEND = [("房租", 1200.00), ("食物", 469.34), ("飲品", 62.65),
         ("交通", 61.71), ("點心", 46.31), ("網路", 10.00)]
TOTAL = sum(v for _, v in SPEND)
RING = [RED, NAVY, NAVY_2, NAVY_3, NAVY_4, NAVY_5]
CX, CY, R, SW = 330, 388, 142, 52
GAP = 0.6

segs, acc = [], 0.0
for i, (name, v) in enumerate(SPEND):
    pct = v / TOTAL * 100
    segs.append(f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="none" stroke="{RING[i]}" '
                f'stroke-width="{SW}" pathLength="100" '
                f'stroke-dasharray="{max(pct - GAP, 0.35):.2f} 100" '
                f'stroke-dashoffset="{-acc:.2f}"/>')
    acc += pct

legend = []
for i, (name, v) in enumerate(SPEND):
    y = 232 + i * 62
    legend += [
        f'<rect x="760" y="{y - 15}" width="20" height="20" fill="{RING[i]}"/>',
        txt(798, y, name, 22, fill=NAVY, weight=700),
        txt(1108, y, f"{v:,.0f}", 22, fill=NAVY, weight=700, anchor="end",
            family=MONO),
        txt(1232, y, f"{v / TOTAL * 100:.1f}%", 20, fill=MUTED, anchor="end", family=MONO),
    ]

chart = page("content",
    header("生活開銷", 3, 8, right="COST OF LIVING") +
    g("doughnut", "160 230 340 320",
      f'<g transform="rotate(-90 {CX} {CY})">' + "".join(segs) + "</g>",
      ttl(CX, CY + 6, "S$1,850", 50, anchor="middle"),
      txt(CX, CY + 44, "每月支出", 20, fill=MUTED, anchor="middle")) +
    g("claim", "48 128 660 90",
      ttl(48, 180, "房租就吃掉三分之二", 44),
      hline(48, 200, 96, col=RED, t=5)) +
    g("legend", "723 92 557 628", vline(720, 92, 628), *legend) +
    g("fx", "160 590 440 60",
      txt(CX, 600, "1 SGD ≈ 25.5 TWD", 19, fill=MUTED, anchor="middle", family=MONO),
      txt(CX, 636, "≈ NT$47,175", 30, fill=NAVY, weight=900, anchor="middle")) +
    g("takeaway", "740 596 492 64",
      card(740, 596, 492, 64, fill=PALE, shadow=0),
      txt(764, 636, "先找房子，再想其他的。", 24, fill=NAVY, weight=700)))

OUT.mkdir(exist_ok=True)
for name in list(OUT.glob("*.svg")):
    name.unlink()
(OUT / "01_cover.svg").write_text(cover, encoding="utf-8")
(OUT / "02_chart.svg").write_text(chart, encoding="utf-8")
print("wrote", OUT)
