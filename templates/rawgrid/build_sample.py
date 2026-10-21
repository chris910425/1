"""Raw Grid sample deck (14 slides) authored with kit/rawgrid.py for PPT Master.

python3 templates/rawgrid/build_sample.py      -> rawgrid_sample/svg_output/*.svg
Then (PPT Master venv):
  icon_sync.py rawgrid_sample fsc-line/... ; icon_sync.py rawgrid_sample fsc-char/alice fsc-char/bob
  stamp_native_fallbacks.py rawgrid_sample/svg_output --write
  svg_quality_checker.py rawgrid_sample --quick-generate --canonical-authoring --stage final --json
  svg_to_pptx.py rawgrid_sample --quick-generate --no-notes --native-charts-and-tables -t morph
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent / "kit"))
from rawgrid import *  # noqa: E402,F403

OUT = pathlib.Path(__file__).parent / "rawgrid_sample_20261022" / "svg_output"
TOTAL = 14
S = {}


def g(gid, bounds, *parts, role=None):
    r = f' data-pptx-role="{role}"' if role else ""
    return f'  <g id="{gid}" data-pptx-bounds="{bounds}"{r}>\n    ' + "\n    ".join(p for p in parts if p) + "\n  </g>\n"


# 01 cover: pink title panel + chapter rows (Raw Grid cover) ---------------------------------
net, _ = network(10, 430, 540, 280, n=14, faint=True, lines=FAINT_PINK, seed=1)
rows = ["交易是什麼", "從簽名到廣播", "區塊與鏈", "默克爾樹", "訊息如何傳開", "共識與確認"]
cover_rows = "".join(
    g(f"row-{i + 1}", f"563 {i * 120} 717 120",
      cell(563, i * 120, 717, 117, GREEN if i == 2 else PAPER), hline(560, i * 120 + 117, 720) if i < 5 else "",
      f'<text x="604" y="{i * 120 + 70}" font-size="24" font-weight="bold" fill="{INK}">→　{esc(t)}</text>',
      f'<text x="1240" y="{i * 120 + 70}" text-anchor="end" font-family="{MONO}" font-size="16" fill="{MUTED}">CH.{i + 1:02d}</text>')
    for i, t in enumerate(rows))
S["01_cover"] = page("cover", g("panel", "0 0 563 720",
                                 cell(0, 0, 560, 720, PINK), vline(560, 0, 720), net,
                                 label(40, 40, "MSBT 6001", 14),
                                 title(40, 228, "區塊鏈的", 84), title(40, 330, "交易旅程", 84),
                                 f'<text x="44" y="384" font-size="18" font-weight="bold" fill="{INK}" letter-spacing="1.4">THE LIFE OF A TRANSACTION</text>',
                                 hline(44, 404, 60, t=4),
                                 f'<text x="44" y="446" font-size="18" fill="{INK}">王小明　·　2026 年 10 月</text>') + cover_rows)

# 02 statement + two numbers -----------------------------------------------------------------------
S["02_why"] = page("content",
    g("claim", "0 0 640 720", hline(40, 210, 60, t=4),
      f'<text x="116" y="216" font-size="14" font-weight="bold" fill="{INK}" letter-spacing="1.1">WHY IT MATTERS</text>',
      title(40, 310, "沒有銀行，", 60), title(40, 390, "誰來記帳？", 60),
      para(40, 460, ["區塊鏈讓上千台電腦一起記同一本帳，", "沒有人能偷偷改掉其中一筆。"], 22, fill=DARK),
      vline(640, 0, 720)) +
    g("stat-1", "643 0 637 360", big_number(690, 190, "1,000+", 110),
      f'<text x="694" y="250" font-size="16" font-weight="bold" fill="{INK}" letter-spacing="1.2">NODES</text>',
      text(694, 284, "同時保存同一本帳（示意）", 20, fill=DARK), hline(640, 357, 640)) +
    g("stat-2", "643 360 637 360", cell(643, 360, 637, 360, GREEN), big_number(690, 560, "0", 110),
      f'<text x="694" y="620" font-size="16" font-weight="bold" fill="{INK}" letter-spacing="1.2">MIDDLEMEN</text>',
      text(694, 654, "需要信任的中間人", 20, fill=DARK)))

# 03 chapter divider with a faint Merkle tree --------------------------------------------------------
S["03_chapter"] = page("section",
    g("tree", "660 90 600 540", merkle(670, 110, 580, 500, faint=True, lines=FAINT_GREEN), role="decoration") +
    g("chapter", "40 120 600 520", ghost_number(28, 330, "01", 260, fill="#C9D6B4"),
      label(44, 380, "CHAPTER 01 / 05", 14), title(40, 500, "交易是什麼", 80),
      text(44, 560, "先弄懂一筆交易裡到底裝了什麼。", 24, fill=DARK)), bg=GREEN)

# 04 chain of blocks --------------------------------------------------------------------------------
caps3 = [("PREV 指向上一塊", ["每個區塊都記著", "前一塊的雜湊值。"]), ("HASH 是指紋", ["內容改一個字，", "指紋就完全不同。"]), ("改一塊就斷鏈", ["想竄改，就得把後面", "全部重算一遍。"])]
S["04_chain"] = page("content", header("區塊與鏈", 4, TOTAL) +
    g("chain", "40 120 1210 236", chain(40, 130, 4, 1021, bw=250, bh=210, gap=60)) +
    "".join(g(f"why-{i + 1}", f"{i * 427} 440 {427 if i < 2 else 426} 280",
              hline(0, 440, 1280) if i == 0 else "", vline(i * 427, 440, 280) if i else "",
              f'<text x="{i * 427 + 40}" y="510" font-size="22" font-weight="bold" fill="{INK}">{esc(t)}</text>',
              para(i * 427 + 40, 560, l, 20, fill=DARK)) for i, (t, l) in enumerate(caps3)))

# 05 Merkle proof ---------------------------------------------------------------------------------
S["05_merkle"] = page("content", header("默克爾證明", 5, TOTAL, right="Merkle proof") +
    g("tree", "20 90 800 620", merkle(40, 110, 760, 560, proof=2), vline(820, 72, 648)) +
    g("explain", "823 75 457 645", label(860, 110, "驗證 TX3", 14),
      text(860, 190, "只要 3 個綠色雜湊，", 26, bold=True), text(860, 230, "就能證明 TX3 在區塊裡。", 26, bold=True),
      para(860, 300, ["不用下載整個區塊：", "把 TX3 和兩兩配對的雜湊", "一路算上去，", "結果等於 ROOT 就成立。"], 20, fill=DARK),
      card(860, 520, 380, 110, fill=GREEN), text(884, 568, "8 筆交易 → 3 個雜湊", 22, bold=True),
      text(884, 604, "1,000 筆交易也只要 10 個", 18, fill=DARK)))

# 06-08 network propagation (Morph) ------------------------------------------------------------------
notes = {1: ("HOP 1", "起點把新區塊傳給鄰居。"), 2: ("HOP 2", "鄰居再傳給它們的鄰居。"), 4: ("HOP 4", "幾跳之內，全網都收到了。")}
for k, (si, wave) in enumerate([(6, 1), (7, 2), (8, 4)]):
    netsvg, maxhop = network(40, 110, 820, 560, n=16, wave=wave)
    reached = {1: 4, 2: 9, 4: 16}[wave]
    h_, cap = notes[wave]
    S[f"{si:02d}_gossip_{k + 1}"] = page("content", header("訊息如何傳開", si, TOTAL, right="Gossip") +
        g("net", "30 95 840 600", netsvg, vline(880, 72, 648)) +
        g("hop", "883 75 397 645", big_number(920, 230, h_, 72),
          text(924, 290, cap, 22, bold=True),
          text(924, 380, f"已收到：{reached} / 16 個節點", 20, fill=DARK),
          bar(924, 400, 316, reached / 16, fill=GREEN, h=32),
          f'<circle cx="937" cy="520" r="13" fill="{PINK}" stroke="{INK}" stroke-width="3"/>', text(962, 527, "起點", 18),
          f'<circle cx="937" cy="566" r="13" fill="{GREEN}" stroke="{INK}" stroke-width="3"/>', text(962, 573, "已收到", 18),
          f'<circle cx="937" cy="612" r="13" fill="{PAPER}" stroke="{INK}" stroke-width="3"/>', text(962, 619, "還沒收到", 18)))

# 09 transaction steps ------------------------------------------------------------------------------
steps = [("簽署", "用私鑰簽名，\n證明是本人。"), ("廣播", "送進節點的\n交易池。"), ("驗證", "節點檢查簽名\n與餘額。"),
         ("打包", "被選進下一個\n區塊。"), ("確認", "後面接上更多\n區塊就不可逆。")]
S["09_steps"] = page("content", header("交易的五個關卡", 9, TOTAL) +
    g("steps", "0 75 1280 437", tx_steps(0, 72, 1280, 440, steps, current=2)) +
    g("status", "0 512 1280 208",
      f'<text x="40" y="580" font-size="16" font-weight="bold" fill="{INK}" letter-spacing="1.3">STATUS</text>',
      text(40, 624, "目前在第 3 關：節點正在驗證簽名與餘額。", 24, bold=True),
      bar(40, 650, 1200, 0.6, fill=PINK, h=34, value="60%")))

# 10 doughnut ---------------------------------------------------------------------------------------
nodes = [("全節點", 45), ("輕節點", 30), ("驗證者", 25)]
S["10_chart"] = page("content", header("誰在維護這本帳", 10, TOTAL, right="Illustrative") +
    g("chart", "0 75 640 645", doughnut("p10-node-mix", 320, 395, nodes, ro=215, ri=125),
      title(320, 418, "45%", 64, anchor="middle"), vline(640, 72, 648)) +
    g("legend", "643 75 637 450", legend_rows(643, 75, 637, nodes, row_h=150)) +
    g("takeaway", "643 525 637 195", cell(643, 525, 637, 195, INK),
      f'<text x="680" y="600" font-size="16" font-weight="bold" fill="{PINK}" letter-spacing="1.3">TAKEAWAY</text>',
      text(680, 650, "→ 近一半是全節點：帳本有很多份完整備份。", 24, fill=PAPER, bold=True)))

# 11 text effects -----------------------------------------------------------------------------------
X, Z = 40, 54
fx_rows = [
    (200, "區塊鏈不只是資料庫", fx_highlight(X + 3 * Z, 200, 6 * Z, Z), "HIGHLIGHT"),
    (320, "靠共識決定誰對", fx_underline(X + 1 * Z, 200 + 120, 2 * Z), "UNDERLINE"),
    (440, "寫進去就不可竄改", fx_circle(X + 4 * Z + 2 * Z, 440 - 19, 4 * Z + 40, 92), "CIRCLE"),
    (560, "信任銀行，不如信任數學", fx_strike(X + 2 * Z, 560, 2 * Z, Z), "STRIKE"),
]
fxs = ""
for i, (y, t, effect, name) in enumerate(fx_rows):
    under = effect if name == "HIGHLIGHT" else ""
    over = "" if name == "HIGHLIGHT" else effect
    fxs += g(f"fx-{i + 1}", f"20 {y - 80} 800 120", under, title(X, y, t, Z), over,
             f'<text x="790" y="{y - 8}" text-anchor="end" font-size="13" font-weight="bold" fill="{MUTED}" letter-spacing="1">{name}</text>')
S["11_text_fx"] = page("content", header("重點標註", 11, TOTAL, right="Text effects") + fxs +
    g("hash", "823 75 457 645", vline(820, 72, 648), cell(823, 75, 457, 330, GREEN),
      f'<text x="860" y="130" font-size="13" font-weight="bold" fill="{MUTED}" letter-spacing="1">HASH</text>',
      fx_hash(860, 250, "可驗證", 76, 16), hline(820, 402, 460),
      f'<text x="860" y="460" font-size="13" font-weight="bold" fill="{MUTED}" letter-spacing="1">TYPE</text>',
      fx_type(860, 560, "verify tx3", 34),
      f'<text x="860" y="640" font-size="13" font-weight="bold" fill="{MUTED}" letter-spacing="1">BOX</text>',
      fx_box(940, 612, 140, 46), text(958, 643, "已確認", 22, bold=True)))

# 12 terminal --------------------------------------------------------------------------------------
pts = [("誰付錢", "from：發送方地址，由私鑰簽名證明。"), ("付給誰", "to：接收方，可以是人也可以是合約。"), ("付多少", "value 與 gas：金額，加上手續費。")]
S["12_terminal"] = page("content", header("一筆交易長什麼樣", 12, TOTAL) +
    "".join(g(f"pt-{i + 1}", f"0 {75 + i * 215} 600 215", hline(0, 72 + (i + 1) * 215, 600) if i < 2 else "",
              f'<text x="40" y="{75 + i * 215 + 92}" font-size="30" font-weight="bold" fill="{INK}">→ {esc(a)}</text>',
              text(76, 75 + i * 215 + 140, b, 20, fill=DARK)) for i, (a, b) in enumerate(pts)) +
    g("term", "600 75 680 645", vline(600, 72, 648),
      terminal(640, 110, 580, 520, [("$", "cast tx 0x8f3a…c21e"), ("", "from      0x71C7…976F"), ("", "to        0xA0b8…eB48"),
                                    ("!", "value     0.5 ETH"), ("", "gasUsed   21000"), ("", "nonce     42"),
                                    ("!", "status    ✔ success"), ("$", "_")])))

# 13 icons + characters ------------------------------------------------------------------------------
icons = [("wallet", "錢包"), ("key", "私鑰"), ("block", "區塊"), ("contract", "合約"), ("exchange", "交易所"), ("shield", "安全"), ("gavel", "監理"), ("mrt", "通勤")]
ic = ""
for i, (name, cap) in enumerate(icons):
    cx, cy = (i % 4) * 213, 75 + (i // 4) * 322
    ic += g(f"ic-{name}", f"{cx} {cy} 213 322", cell(cx, cy, 213, 322, PINK if name == "key" else PAPER),
            vline(cx + 210, cy, 322) if True else "", hline(cx, cy + 319, 213) if i < 4 else "",
            icon(name, cx + 58, cy + 70, 96), text(cx + 106, cy + 240, cap, 22, bold=True, anchor="middle"),
            f'<text x="{cx + 106}" y="{cy + 272}" text-anchor="middle" font-family="{MONO}" font-size="13" fill="{MUTED}">fsc-line/{name}</text>')
S["13_icons"] = page("content", header("工具箱：圖示", 13, TOTAL, right="Icons") + ic +
    g("people", "855 75 425 645", cell(855, 75, 425, 645, GREEN),
      icon("alice", 890, 150, 150, lib="fsc-char"), icon("bob", 1080, 150, 150, lib="fsc-char"),
      text(965, 400, "Alice", 26, bold=True, anchor="middle"), text(1155, 400, "Bob", 26, bold=True, anchor="middle"),
      para(890, 480, ["密碼學課本的老朋友：", "Alice 傳訊息給 Bob，", "Eve 在偷聽。"], 20, fill=DARK),
      f'<text x="890" y="650" font-family="{MONO}" font-size="13" fill="{MUTED}">fsc-char/alice · bob · eve · trent · mallory</text>'))

# 14 closing ------------------------------------------------------------------------------------------
S["14_closing"] = page("ending",
    g("thanks", "0 0 563 720", cell(0, 0, 560, 720, PINK), vline(560, 0, 720),
      title(40, 320, "謝謝聆聽", 84), f'<text x="44" y="376" font-size="18" font-weight="bold" fill="{INK}" letter-spacing="1.4">LET\'S BUILD.</text>',
      text(44, 430, "還有問題嗎？歡迎現在提問。", 22), hline(44, 470, 470, t=6)) +
    g("contact", "563 0 717 560",
      f'<text x="604" y="120" font-size="16" font-weight="bold" fill="{INK}" letter-spacing="1.3">GET IN TOUCH</text>',
      text(604, 190, "Email　xiaoming@e.ntu.edu.sg（示意）", 22), text(604, 240, "課程　MSBT 6001 分散式帳本技術", 22),
      text(604, 290, "簡報　github.com/chris910425（示意）", 22)) +
    g("buttons", "563 560 717 160", hline(560, 560, 720), cell(563, 563, 357, 157, GREEN), vline(920, 560, 160),
      cell(923, 563, 357, 157, INK), text(741, 650, "Q & A", 26, bold=True, anchor="middle"),
      text(1101, 650, "→ 下一步", 26, bold=True, anchor="middle", fill=PAPER)))

OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob("*.svg"):
    f.unlink()
for k, v in S.items():
    (OUT / f"{k}.svg").write_text(v)
print(f"wrote {len(S)} slides -> {OUT}")
