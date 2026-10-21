"""Bitgrid sample deck: hand-authored slide SVGs for PPT Master (1280x720).

Raw Grid framework (3px black cell borders, hard offset shadows, arrows,
segmented bars) + Retro Windows (navy title bars, terminal screens) +
8-bit Orbit titles (pixel type with a yellow step shadow).
Run:  python3 templates/bitgrid/author.py   (writes bitgrid_20261021/svg_output/)
"""
import pathlib
from xml.sax.saxutils import escape as esc

OUT = pathlib.Path(__file__).parent / "bitgrid_20261021" / "svg_output"

# ---- tokens -------------------------------------------------------------
INK, PAPER, CELL = "#0A0A0A", "#FFFFFF", "#F2F2EF"
NAVY, NIGHT, BAR = "#14168A", "#0B0E2E", "#1B1FA8"
CYAN, YELLOW, PINK, MINT = "#6FE0EE", "#FFD84A", "#FF9EC7", "#8EF0AE"
MUTED, SCREEN, SCREEN_INK = "#55575E", "#0D1117", "#A6F4C0"
PIX = "Cubic 11, Microsoft JhengHei"          # titles (pixel)
SANS = "Segoe UI, Microsoft JhengHei"          # body
MONO = "Consolas, Microsoft JhengHei"          # terminal, labels
DECK, TOTAL = "區塊鏈的交易旅程", 10

UNITS = (2, 3, 4, 5, 6, 7, 12)
SHADOW_STEP = {4: 2, 5: 3, 6: 3, 8: 4, 10: 5, 11: 6, 14: 7, 24: 12}   # font pixel -> shadow offset (half)
# Cubic 11 is drawn on a 12px grid: one font pixel = size / 12
DEFS = "  <defs>\n" + "".join(
    f'    <filter id="px{u}{tag}" x="-10%" y="-10%" width="130%" height="140%">'
    f'<feDropShadow dx="{u}" dy="{u}" stdDeviation="0" flood-color="{col}" flood-opacity="1"/></filter>\n'
    for u in UNITS for tag, col in (("", YELLOW), ("k", INK))) + "  </defs>"


def page(role, body, bg=PAPER, defs=True):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" lang="zh-Hant" '
            f'data-pptx-page-role="{role}" font-family="{SANS}">\n'
            + (DEFS + "\n" if defs else "")
            + f'  <rect id="bg" data-pptx-role="background" x="0" y="0" width="1280" height="720" fill="{bg}"/>\n'
            + body + "</svg>\n")


def ptitle(x, y, text, size, fill=INK, shadow="pxShadow", stroke=None, anchor=None):
    """Pixel title: Cubic 11, thickened with a same-colour outline, hard step shadow."""
    u = round(size / 12)                       # one font pixel
    sw = max(2, round(u / 2))                  # thicken strokes by half a font pixel
    a = f' text-anchor="{anchor}"' if anchor else ""
    d = SHADOW_STEP[min(SHADOW_STEP, key=lambda k: abs(k - u))]   # half a font pixel reads as a clean 3D edge
    sh = f' filter="url(#px{d}{"k" if shadow == "pxShadowInk" else ""})"' if shadow else ""
    return (f'<text x="{x}" y="{y}" font-family="{PIX}" font-size="{size}" fill="{fill}" '
            f'stroke="{stroke or fill}" stroke-width="{sw}"{a}{sh}>{esc(text)}</text>')


def hline(x, y, w, col=INK, t=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{t}" fill="{col}"/>'


def vline(x, y, h, col=INK, t=3):
    return f'<rect x="{x}" y="{y}" width="{t}" height="{h}" fill="{col}"/>'


def label(x, y, text, fill=INK, ink=PAPER, size=16, anchor="start", pad=10):
    w = round(len(text) * size * 0.58) + pad * 2 + sum(size * 0.45 for c in text if ord(c) > 0x2E80)
    x0 = x - w if anchor == "end" else x
    return (f'<rect x="{x0:.0f}" y="{y}" width="{w:.0f}" height="{size + 14}" fill="{fill}"/>'
            f'<text x="{x0 + pad:.0f}" y="{y + size + 2}" font-family="{MONO}" font-size="{size}" font-weight="bold" fill="{ink}">{esc(text)}</text>')


def segbar(x, y, n, filled, cell=22, gap=4, on=INK, off=None, frame=INK):
    """8-bit segmented progress bar inside a 3px frame."""
    w = n * cell + (n - 1) * gap + 12
    s = [f'<rect x="{x}" y="{y}" width="{w}" height="{cell + 12}" fill="{PAPER}" stroke="{frame}" stroke-width="3"/>']
    for i in range(n):
        col = on if i < filled else (off or CELL)
        s.append(f'<rect x="{x + 6 + i * (cell + gap)}" y="{y + 6}" width="{cell}" height="{cell}" fill="{col}"/>')
    return "".join(s), w


def parrow(x, y, s=6, col=INK):
    """Pixel arrow pointing right, built from stepped squares (s = pixel size)."""
    px = [(0, 3), (1, 3), (2, 3), (3, 3), (4, 3), (5, 3), (4, 1), (4, 2), (4, 4), (4, 5), (5, 2), (5, 4), (6, 3), (3, 0), (3, 6)]
    px = [(c, r) for c, r in px if not (c == 3 and r in (0, 6))] + [(3, 1), (3, 5)]
    return "".join(f'<rect x="{x + c * s}" y="{y + r * s}" width="{s}" height="{s}" fill="{col}"/>' for c, r in px)


def header(title, block, sub=None):
    t = ptitle(40, 60, title, 48, shadow="pxShadow")
    s = (f'<text x="{40 + len(title) * 48 + 28}" y="58" font-size="18" fill="{MUTED}">{esc(sub)}</text>' if sub else "")
    return (f'  <g id="header" data-pptx-bounds="0 0 1280 87">\n    {t}{s}\n    {label(1240, 28, f"BLOCK #{block}", anchor="end")}\n'
            f'    {hline(0, 84, 1280)}\n  </g>\n')


def footer(n, dark=False):
    c = "#9AA0C8" if dark else MUTED
    line = hline(0, 684, 1280, col="#2A2F6E" if dark else INK)
    return (f'  <g id="footer" data-pptx-bounds="0 684 1280 36" font-family="{MONO}" font-size="16" fill="{c}">\n'
            f'    {line}<text x="40" y="708">{DECK}</text><text x="1240" y="708" text-anchor="end">{n:02d} / {TOTAL:02d}</text>\n  </g>\n')


def window(gid, x, y, w, h, title, inner, bar=BAR, shadow=INK):
    """Retro window: 3px frame, navy title bar with three boxes, hard shadow."""
    btn = "".join(f'<rect x="{x + w - 26 - i * 24}" y="{y + 9}" width="18" height="16" fill="{CELL}" stroke="{INK}" stroke-width="2"/>' for i in range(3))
    return (f'  <g id="{gid}" data-pptx-bounds="{x} {y} {w + 10} {h + 10}">\n'
            f'    <rect x="{x + 10}" y="{y + 10}" width="{w}" height="{h}" fill="{shadow}"/>\n'
            f'    <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{PAPER}" stroke="{INK}" stroke-width="3"/>\n'
            f'    <rect x="{x + 1.5}" y="{y + 1.5}" width="{w - 3}" height="33" fill="{bar}"/>\n'
            f'    <text x="{x + 14}" y="{y + 24}" font-family="{MONO}" font-size="16" font-weight="bold" fill="{PAPER}">■ {esc(title)}</text>{btn}\n'
            f'    {hline(x, y + 34, w)}\n{inner}  </g>\n')


def stars(seed, area, n=14):
    import random
    r = random.Random(seed); x0, y0, x1, y1 = area; out = []
    for _ in range(n):
        s = r.choice([4, 4, 6, 8]); c = r.choice([CYAN, YELLOW, PINK, "#3A4290"])
        out.append(f'<rect x="{r.randint(x0, x1)}" y="{r.randint(y0, y1)}" width="{s}" height="{s}" fill="{c}"/>')
    return "".join(out)


slides = {}

MINER = "".join(f'    <rect x="796" y="{172 + i * 44}" width="8" height="8" fill="{CYAN if i < 5 else CELL}"/>'
                f'<text x="818" y="{186 + i * 44}" font-family="{MONO}" font-size="20" fill="{c}">{esc(t)}</text>\n' for i, (t, c) in enumerate([
    ("收集交易　312 筆", INK), ("計算 nonce　試算中", INK), ("hash 0000a3f9…e71c", MUTED),
    ("符合難度　✔", INK), ("廣播區塊 #1024", INK), ("獎勵 3.125 BTC", MUTED)])) + "".join(
    f'    <rect x="{796 + i * 26}" y="452" width="20" height="20" fill="{CYAN if i < 11 else CELL}"/>\n' for i, _ in enumerate(range(15)))

# 01 cover --------------------------------------------------------------------
bar, bw = segbar(40, 560, 14, 10, cell=20, on=CYAN, off="#1E2466", frame=CYAN)
slides["01_cover"] = page("cover", f"""  <rect id="grid" data-pptx-role="decoration" x="0" y="0" width="1280" height="720" fill="url(#bgGrid)"/>
  <g id="sky" data-pptx-role="decoration" data-pptx-bounds="560 30 160 80">{stars(7, (580, 40, 700, 100), 6)}</g>
  <g id="kicker" data-pptx-bounds="40 40 600 40">{label(40, 44, "MSBT 6001 ‧ 區塊鏈技術", fill=CYAN, ink=NIGHT)}</g>
  <g id="title" data-pptx-bounds="40 130 680 300">
    {ptitle(40, 250, "區塊鏈的", 120, fill=CYAN)}
    {ptitle(40, 390, "交易旅程", 120, fill=CYAN)}
  </g>
  <g id="subtitle" data-pptx-bounds="40 440 680 50" font-size="26" fill="#C9D0F2">
    <text x="40" y="474">從一個簽名到最終確認：一筆交易如何寫進帳本</text>
  </g>
  <g id="loading" data-pptx-bounds="40 530 680 70">
    <text x="40" y="548" font-family="{MONO}" font-size="16" font-weight="bold" fill="{CYAN}">LOADING BLOCK #1024 ……… 72%</text>
    {bar}
  </g>
  <g id="info" data-pptx-bounds="0 628 1280 92" font-family="{MONO}" font-size="16" fill="#C9D0F2">
    {hline(0, 628, 1280, col=CYAN)}{vline(426, 628, 92, col=CYAN)}{vline(852, 628, 92, col=CYAN)}
    <text x="40" y="660" fill="{YELLOW}" font-weight="bold">PRESENTER</text><text x="40" y="690" font-family="{SANS}" font-size="20">王小明　MSBT 2026</text>
    <text x="466" y="660" fill="{YELLOW}" font-weight="bold">DATE</text><text x="466" y="690" font-family="{SANS}" font-size="20">2026 年 10 月 21 日</text>
    <text x="892" y="660" fill="{YELLOW}" font-weight="bold">COURSE</text><text x="892" y="690" font-family="{SANS}" font-size="20">分散式帳本技術</text>
  </g>
""" + window("miner", 770, 110, 450, 400, "MINER.EXE", MINER, shadow=CYAN), bg=NIGHT).replace("  </defs>", f"""    <pattern id="bgGrid" data-pptx-pattern="smGrid" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="{NIGHT}"/><path d="M0 0H8M0 0V8" stroke="#1A2058"/>
    </pattern>
  </defs>""")

# 02 agenda -------------------------------------------------------------------
items = [("01", "交易是什麼"), ("02", "從簽名到廣播"), ("03", "礦工與驗證者"), ("04", "最終確認與安全")]
rows = []
for i, (n, t) in enumerate(items):
    y = 0 + i * 180
    fill = YELLOW if i == 0 else PAPER
    rows.append(f'  <g id="item-{n}" data-pptx-bounds="563 {y} 717 180">\n'
                f'    <rect x="563" y="{y}" width="717" height="180" fill="{fill}"/>{hline(560, y + 177, 720) if i < 3 else ""}\n'
                f'    {parrow(612, y + 69, s=6)}\n'
                f'    <text x="680" y="{y + 82}" font-family="{MONO}" font-size="20" font-weight="bold" fill="{MUTED}">CH.{n}</text>\n'
                f'    {ptitle(680, y + 128, t, 48, shadow=None)}\n  </g>\n')
slides["02_agenda"] = page("toc", f"""  <g id="side" data-pptx-bounds="0 0 563 720">
    <rect x="0" y="0" width="560" height="720" fill="{CYAN}"/>{vline(560, 0, 720)}
    {label(40, 40, "BLOCK #1025")}
    {ptitle(40, 330, "目錄", 132, shadow="pxShadow", fill=INK)}
    <text x="44" y="400" font-size="24" font-weight="bold" fill="{INK}">4 個章節　約 15 分鐘</text>
    <text x="44" y="640" font-family="{MONO}" font-size="16" fill="{INK}">{DECK}　02 / {TOTAL:02d}</text>
  </g>
""" + "".join(rows), defs=True)

# 03 section ------------------------------------------------------------------
sb, _ = segbar(40, 560, 4, 1, cell=60, gap=8, on=INK)
slides["03_section"] = page("section", f"""  <g id="num" data-pptx-bounds="40 40 600 450">
    {ptitle(40, 360, "01", 288, fill=INK, shadow="pxShadow", stroke=INK)}
  </g>
  <g id="chapter" data-pptx-bounds="640 150 600 300">
    {label(640, 170, "CHAPTER 01 / 04")}
    {ptitle(640, 300, "交易是什麼", 72, shadow=None)}
    <text x="642" y="360" font-size="26" fill="{INK}">先弄懂一筆交易裡<tspan font-weight="bold">到底裝了什麼</tspan>。</text>
  </g>
  <g id="progress" data-pptx-bounds="40 530 600 145">{sb}
    <text x="40" y="660" font-family="{MONO}" font-size="16" font-weight="bold" fill="{INK}">PROGRESS 1 / 4</text>
  </g>
  {footer(3).replace('fill="{0}"'.format(MUTED), f'fill="{INK}"')}""", bg=YELLOW)

# 04 terminal -----------------------------------------------------------------
term = [("$", " cast tx 0x8f3a…c21e", CYAN), ("", "from      0x71C7…976F", SCREEN_INK), ("", "to        0xA0b8…eB48", SCREEN_INK),
        ("", "value     0.5 ETH", YELLOW), ("", "gasUsed   21000", SCREEN_INK), ("", "nonce     42", SCREEN_INK),
        ("", "status    ✔ success", MINT), ("$", " _", CYAN)]
tl = "".join(f'    <text x="676" y="{232 + i * 40}" xml:space="preserve"><tspan fill="{CYAN}">{p}</tspan><tspan fill="{c}">{esc(t)}</tspan></text>\n' for i, (p, t, c) in enumerate(term))
points = [("誰付錢", "from：發送方地址，由私鑰簽名證明。"), ("付給誰", "to：接收方地址，可以是人也可以是合約。"), ("付多少", "value 與 gas：金額，加上給網路的手續費。")]
pts = "".join(f'    <rect x="40" y="{160 + i * 170}" width="16" height="16" fill="{INK}"/>\n    <text x="74" y="{178 + i * 170}" font-size="36" font-weight="bold" fill="{INK}">{a}</text>\n'
              f'    <text x="74" y="{224 + i * 170}" font-size="24" fill="{MUTED}">{esc(b)}</text>\n' for i, (a, b) in enumerate(points))
slides["04_terminal"] = page("content", header("一筆交易長什麼樣", 1027) + f"""  <g id="points" data-pptx-bounds="0 87 600 597">
    {vline(597, 87, 597)}
{pts}  </g>
""" + window("terminal", 650, 140, 580, 450, "TERMINAL.EXE",
             f'    <rect x="651.5" y="175.5" width="577" height="413" fill="{SCREEN}"/>\n    <g font-family="{MONO}" font-size="22">\n{tl}    </g>\n'
             f'    <rect x="706" y="508" width="14" height="24" fill="{CYAN}"/>\n') + footer(4))

# 05 process ------------------------------------------------------------------
steps = [("01", "簽署", "用私鑰簽名，\n證明是本人。"), ("02", "廣播", "送進節點的\n交易池等待。"), ("03", "打包", "被選進下一個\n區塊。"), ("04", "確認", "後面接上更多\n區塊，越來越穩。")]
boxes = []
for i, (n, t, d) in enumerate(steps):
    x = 40 + i * 310; hi = i == 2
    d1, d2 = d.split("\n")
    boxes.append(f'  <g id="step-{n}" data-pptx-bounds="{x} 120 {270 if i == 3 else 300} 360">\n'
                 f'    <rect x="{x + 8}" y="{140}" width="230" height="330" fill="{INK}"/>\n'
                 f'    <rect x="{x}" y="132" width="230" height="330" fill="{CYAN if hi else PAPER}" stroke="{INK}" stroke-width="3"/>\n'
                 f'    <rect x="{x}" y="132" width="64" height="44" fill="{INK}"/><text x="{x + 12}" y="165" font-family="{PIX}" font-size="24" fill="{PAPER}">{n}</text>\n'
                 f'    {ptitle(x + 22, 280, t, 60, shadow=None)}\n'
                 f'    <text x="{x + 22}" y="360" font-size="22" fill="{INK}">{d1}<tspan x="{x + 22}" dy="34">{d2}</tspan></text>\n'
                 + (f'    {parrow(x + 244, 276, s=6)}\n' if i < 3 else "") + '  </g>\n')
pb, pw = segbar(40, 560, 32, 21, cell=32, gap=5)
slides["05_process"] = page("content", header("交易的四個關卡", 1028) + "".join(boxes) + f"""  <g id="progress" data-pptx-bounds="40 500 1200 120">
    <text x="40" y="540" font-family="{MONO}" font-size="18" font-weight="bold" fill="{INK}">STATUS ▸ 第 3 關：打包進區塊</text>
    <text x="1240" y="540" text-anchor="end" font-family="{MONO}" font-size="18" font-weight="bold" fill="{INK}">67%</text>
    {pb}
  </g>
""" + footer(5))

# 06 doughnut (native chart) ---------------------------------------------------
import math
data = [("全節點", 45, INK), ("輕節點", 30, CYAN), ("驗證者", 25, YELLOW)]
cx, cy, ro, ri = 330, 390, 200, 118
arcs, a0 = [], -90.0
for name, v, col in data:
    a1 = a0 + v * 3.6
    p = lambda a, r: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p(a0, ro), p(a1, ro), p(a1, ri), p(a0, ri)
    large = 1 if v * 3.6 > 180 else 0
    arcs.append(f'      <path d="M{x0:.1f} {y0:.1f} A{ro} {ro} 0 {large} 1 {x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} A{ri} {ri} 0 {large} 0 {x3:.1f} {y3:.1f} Z" fill="{col}" stroke="{INK}" stroke-width="3"/>\n')
    a0 = a1
meta = ('{"x": 130, "y": 190, "width": 400, "height": 400, "name": "p06-node-mix", "type": "doughnut", '
        '"categories": ["全節點", "輕節點", "驗證者"], "series": [{"name": "節點占比", "values": [45, 30, 25]}], '
        f'"show_legend": false, "style": {{"colors": ["{INK}", "{CYAN}", "{YELLOW}"]}}}}')
legend = []
for i, (name, v, col) in enumerate(data):
    y = 87 + i * 160
    b, _ = segbar(700, y + 96, 20, round(v / 5), cell=18, gap=4, on=col if col != YELLOW else INK, off=CELL)
    legend.append(f'  <g id="legend-{i + 1}" data-pptx-bounds="660 {y} 620 160">\n    <rect x="663" y="{y}" width="617" height="160" fill="{CELL if i == 0 else PAPER}"/>{hline(660, y + 157, 620)}\n'
                  f'    <rect x="700" y="{y + 34}" width="34" height="34" fill="{col}" stroke="{INK}" stroke-width="3"/>\n'
                  f'    <text x="752" y="{y + 64}" font-size="30" font-weight="bold" fill="{INK}">{name}</text>\n'
                  f'    {ptitle(1240, y + 70, f"{v}%", 48, shadow=None, anchor="end")}\n    {b}\n  </g>\n')
slides["06_chart"] = page("content", header("誰在維護這本帳", 1029, sub="節點類型占比（示意）") + f"""  <g id="chart-area" data-pptx-bounds="0 87 660 597">
    {vline(657, 87, 597)}
    <g id="p06-node-mix" data-pptx-replace-with="chart">
      <metadata type="application/json">{meta}</metadata>
{''.join(arcs)}    </g>
    {ptitle(cx, cy + 22, "45%", 60, shadow=None, anchor="middle")}
  </g>
""" + "".join(legend) + f"""  <g id="takeaway" data-pptx-bounds="660 567 620 117">
    <rect x="663" y="567" width="617" height="117" fill="{INK}"/>
    <text x="700" y="636" font-size="24" font-weight="bold" fill="{PAPER}">→ 近一半是全節點：帳本有很多份完整備份。</text>
  </g>
""" + footer(6))

# 07 KPI grid -------------------------------------------------------------------
kpis = [("12", "秒", "平均出塊時間", 6, PAPER), ("1,024", "", "活躍驗證者", 16, PINK), ("15", "TPS", "每秒交易量", 3, PAPER), ("13", "分鐘", "最終確認時間", 10, CELL)]
cells = []
for i, (v, u, lab, f, bgc) in enumerate(kpis):
    x, y = (i % 2) * 640, 87 + (i // 2) * 299
    b, _ = segbar(x + 40, y + 210, 20, f, cell=20, gap=5)
    cells.append(f'  <g id="kpi-{i + 1}" data-pptx-bounds="{x} {y} 640 299">\n    <rect x="{x + (3 if i % 2 else 0)}" y="{y}" width="{637}" height="296" fill="{bgc}"/>'
                 + (vline(640, y, 299) if i % 2 == 0 else "") + (hline(0, 383, 1280) if i == 1 else "")
                 + f'\n    <text x="{x + 40}" y="{y + 52}" font-family="{MONO}" font-size="18" font-weight="bold" fill="{MUTED}">{lab}</text>\n'
                 f'    {ptitle(x + 40, y + 160, v, 96, shadow="pxShadow")}'
                 f'<text x="{x + 40 + len(v) * 52 + 24}" y="{y + 158}" font-size="30" font-weight="bold" fill="{INK}">{u}</text>\n    {b}\n  </g>\n')
slides["07_numbers"] = page("content", header("網路健康檢查", 1030, sub="數字為示意") + "".join(cells) + footer(7))

# 08 comparison windows -----------------------------------------------------------
def rows_(x, items, mark):
    s = []
    for i, (k, v) in enumerate(items):
        y = 240 + i * 130
        s.append(f'    <rect x="{x + 24}" y="{y - 24}" width="26" height="26" fill="{mark[i][1]}" stroke="{INK}" stroke-width="3"/>'
                 f'<text x="{x + 30}" y="{y - 4}" font-family="{MONO}" font-size="18" font-weight="bold" fill="{INK}">{mark[i][0]}</text>\n'
                 f'    <text x="{x + 70}" y="{y}" font-size="32" font-weight="bold" fill="{INK}">{k}</text>\n'
                 f'    <text x="{x + 70}" y="{y + 42}" font-size="24" fill="{MUTED}">{v}</text>\n')
    return "".join(s)
left = rows_(40, [("一個管理者", "銀行說了算，帳本只有一份。"), ("快", "不需要大家同意，馬上入帳。"), ("單點風險", "伺服器出事，全部停擺。")], [("✔", PAPER), ("✔", PAPER), ("✖", PINK)])
right = rows_(680, [("大家一起記", "每個節點都有一份帳本。"), ("慢一點", "需要共識，等幾個區塊。"), ("難以竄改", "要改帳得同時騙過多數節點。")], [("✔", CYAN), ("✖", PAPER), ("✔", CYAN)])
slides["08_compare"] = page("content", header("中心化 vs 去中心化", 1031) +
                            window("win-central", 40, 120, 560, 520, "CENTRAL.EXE", left, bar="#5A5C66") +
                            window("win-decentral", 680, 120, 560, 520, "DECENTRAL.EXE", right, shadow=CYAN) + footer(8))

# 09 chain timeline ---------------------------------------------------------------
blocks = [("#1021", "2009", "比特幣創世區塊"), ("#1022", "2015", "以太坊與智能合約"), ("#1023", "2022", "以太坊轉為權益證明"), ("#1024", "2026", "你的第一筆交易")]
chain = []
for i, (h, yr, t) in enumerate(blocks):
    x = 40 + i * 310; last = i == 3
    chain.append(f'  <g id="blk-{i + 1}" data-pptx-bounds="{x} 140 {300 if i < 3 else 280} 350">\n'
                 f'    <rect x="{x + 8}" y="158" width="220" height="220" fill="{INK}"/>\n'
                 f'    <rect x="{x}" y="150" width="220" height="220" fill="{YELLOW if last else PAPER}" stroke="{INK}" stroke-width="3"/>\n'
                 f'    <text x="{x + 20}" y="188" font-family="{MONO}" font-size="18" font-weight="bold" fill="{MUTED}">BLOCK {h}</text>\n'
                 f'    {ptitle(x + 20, 300, yr, 72, shadow=None)}\n'
                 + (f'    <rect x="{x + 228}" y="252" width="82" height="16" fill="{INK}"/>\n' if i < 3 else "")
                 + f'    <text x="{x}" y="430" font-size="26" font-weight="bold" fill="{INK}">{t}</text>\n'
                 f'    <text x="{x}" y="470" font-family="{MONO}" font-size="16" fill="{MUTED}">prev = {blocks[i - 1][0] if i else "0x0000"}</text>\n  </g>\n')
slides["09_timeline"] = page("content", header("一條鏈，四個時刻", 1032) + "".join(chain) + f"""  <g id="note" data-pptx-bounds="40 540 1200 110">
    {hline(40, 560, 1200)}
    <text x="40" y="616" font-size="24" fill="{INK}">每個區塊都記著<tspan font-weight="bold">前一個區塊的編號</tspan>，所以改一個就得改後面全部。</text>
  </g>
""" + footer(9))

# 10 closing ----------------------------------------------------------------------
dlg = (f'    <text x="740" y="320" font-size="34" font-weight="bold" fill="{INK}">還有問題嗎？</text>\n'
       f'    <text x="740" y="368" font-size="24" fill="{MUTED}">歡迎現在提問，或課後找我聊。</text>\n'
       f'    <rect x="756" y="450" width="140" height="52" fill="{INK}"/><rect x="750" y="444" width="140" height="52" fill="{CYAN}" stroke="{INK}" stroke-width="3"/>'
       f'<text x="820" y="479" text-anchor="middle" font-size="22" font-weight="bold" fill="{INK}">是</text>\n'
       f'    <rect x="926" y="450" width="140" height="52" fill="{INK}"/><rect x="920" y="444" width="140" height="52" fill="{PAPER}" stroke="{INK}" stroke-width="3"/>'
       f'<text x="990" y="479" text-anchor="middle" font-size="22" font-weight="bold" fill="{INK}">否</text>\n')
slides["10_closing"] = page("ending", f"""  <g id="sky" data-pptx-role="decoration" data-pptx-bounds="40 60 600 160">{stars(11, (60, 80, 600, 200), 10)}</g>
  <g id="thanks" data-pptx-bounds="40 230 640 260">
    {ptitle(40, 400, "謝謝", 168, fill=CYAN)}
    <text x="44" y="460" font-family="{MONO}" font-size="20" font-weight="bold" fill="{YELLOW}">GAME SAVED ▸ BLOCK #1033</text>
  </g>
""" + window("dialog", 700, 220, 520, 320, "QUESTIONS.EXE", dlg, shadow=CYAN) + footer(10, dark=True), bg=NIGHT)

OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob("*.svg"):
    f.unlink()
for name, svg in slides.items():
    (OUT / f"{name}.svg").write_text(svg)
print("wrote", len(slides), "slides to", OUT)
