"""Raw Grid component kit deck: every library element in PowerPoint, ready to copy-paste.

python3 templates/rawgrid/build_kit.py   -> rawgrid_kit_20261022/svg_output/*.svg (+ icon list printed)
"""
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE / "kit"))
from rawgrid import *  # noqa: E402,F403

OUT = HERE / "rawgrid_kit_20261022" / "svg_output"
ICONS = sorted(p.stem for p in (HERE.parents[1] / ".claude/skills/ppt-master/templates/icons/fsc-line").glob("*.svg"))
CHARS = ["alice", "bob", "eve", "trent", "mallory"]
TOTAL = 10
S = {}


def g(gid, bounds, *parts, role=None):
    r = f' data-pptx-role="{role}"' if role else ""
    return f'  <g id="{gid}" data-pptx-bounds="{bounds}"{r}>\n    ' + "\n    ".join(p for p in parts if p) + "\n  </g>\n"


def tag(x, y, s):
    return f'<text x="{x}" y="{y}" font-size="13" font-weight="bold" fill="{MUTED}" letter-spacing="1">{esc(caps(s))}</text>'


S["01_chain"] = page("content", header("區塊鏈 Chain of blocks", 1, TOTAL, right="kit") +
    g("full", "40 90 1210 290", tag(40, 108, "full · chain(x, y, n, start, bw, bh, gap)"), chain(40, 130, 4, 1021, bw=250, bh=210, gap=60)) +
    g("faint", "40 400 1210 160", hline(0, 386, 1280), tag(40, 420, "faint · chain(..., faint=True)"), chain(40, 440, 5, 1, bw=200, bh=100, gap=50, faint=True)) +
    g("progress", "40 590 1200 110", hline(0, 576, 1280), tag(40, 610, "progress_chain(x, y, n, total) · header progress bar"),
      progress_chain(40, 640, 5, 14, size=24, gap=12)))

S["02_merkle"] = page("content", header("默克爾樹 Merkle tree", 2, TOTAL, right="kit") +
    g("full", "20 90 780 620", tag(40, 108, "full · merkle(x, y, w, h, leaves, proof=2)"), merkle(40, 130, 740, 560, proof=2), vline(800, 72, 648)) +
    g("faint", "803 75 477 645", tag(840, 108, "faint · merkle(..., faint=True)"), merkle(840, 140, 400, 520, leaves=("A", "B", "C", "D"), faint=True)))

for k, wave in enumerate([0, 1, 2]):
    netsvg, _ = network(40, 120, 760, 520, n=16, wave=wave)
    S[f"0{3 + k}_net_{wave}"] = page("content", header("網路傳播 Gossip", 3 + k, TOTAL, right="kit · morph") +
        g("net", "30 95 780 600", tag(40, 108, f"network(x, y, w, h, n=16, wave={wave})"), netsvg, vline(820, 72, 648)) +
        g("note", "823 75 457 645", big_number(860, 220, f"WAVE {wave}", 64),
          para(860, 290, ["連續幾張投影片用同樣的節點、", "wave 0 → 1 → 2 …，", "再加上 Morph 轉場，", "訊息就會一跳一跳傳開。"], 20, fill=DARK),
          tag(860, 600, "faint · network(..., faint=True)"),
          network(860, 470, 380, 110, n=12, faint=True)[0]))

S["06_steps"] = page("content", header("交易步驟 Steps", 6, TOTAL, right="kit") +
    g("steps", "0 75 1280 437", tx_steps(0, 72, 1280, 440, [("簽署", "用私鑰簽名"), ("廣播", "進入交易池"), ("驗證", "檢查簽名"), ("打包", "選進區塊")], current=1)) +
    g("bars", "0 512 1280 208", tag(40, 556, "bar(x, y, w, frac, fill, value) · label(x, y, text) · arrow"),
      bar(40, 580, 560, 0.72, fill=PINK, value="72%"), bar(640, 580, 560, 0.4, fill=GREEN, value="40%"),
      label(40, 640, "LABEL"), label(170, 640, "標籤", inverse=False), text(330, 662, "→ ARROW ITEM", 22, bold=True)))

nodes = [("全節點", 45), ("輕節點", 30), ("驗證者", 25)]
S["07_doughnut"] = page("content", header("甜甜圈圖 Doughnut", 7, TOTAL, right="kit · native chart") +
    g("chart", "0 75 640 645", doughnut("k07-doughnut", 320, 395, nodes, ro=215, ri=125), title(320, 418, "45%", 64, anchor="middle"), vline(640, 72, 648)) +
    g("legend", "643 75 637 645", legend_rows(643, 75, 637, nodes, row_h=150),
      tag(680, 560, "doughnut(key, cx, cy, data) + legend_rows(...)"),
      para(680, 610, ["PowerPoint 裡是真的圖表：", "右鍵 → 編輯資料 就能改數字。"], 20, fill=DARK)))

S["08_text_fx"] = page("content", header("文字效果 Text effects", 8, TOTAL, right="kit") +
    g("fx", "20 90 1240 620",
      fx_highlight(40 + 0 * 52, 190, 4 * 52, 52), title(40, 190, "重點標記", 52), tag(40, 230, "fx_highlight"),
      title(440, 190, "手繪底線", 52), fx_underline(440, 190, 4 * 52), tag(440, 230, "fx_underline"),
      title(840, 190, "圈起來", 52), fx_circle(840 + 78, 172, 3 * 52 + 40, 84), tag(840, 230, "fx_circle"),
      title(40, 360, "刪除線", 52), fx_strike(40, 360, 3 * 52, 52), tag(40, 400, "fx_strike"),
      fx_box(430, 300, 230, 80), title(450, 360, "框起來", 52), tag(440, 400, "fx_box"),
      fx_bracket(820, 300, 80), title(850, 360, "括號", 52), tag(840, 400, "fx_bracket"),
      fx_hash(40, 540, "Trustless.", 72, 18), tag(40, 640, "fx_hash"),
      fx_type(640, 560, "verify tx3", 40), tag(640, 640, "fx_type")))

ic = ""
for i, name in enumerate(ICONS):
    col, row = i % 10, i // 10
    x, y = 24 + col * 124, 100 + row * 122
    ic += f'    {icon(name, x + 38, y, 48)}\n    <text x="{x + 62}" y="{y + 74}" text-anchor="middle" font-family="{MONO}" font-size="12" fill="{MUTED}">{name}</text>\n'
S["09_icons"] = page("content", header(f"圖示 Icons · fsc-line ({len(ICONS)})", 9, TOTAL, right="kit") + g("icons", "20 90 1240 620", ic.strip()))
S["10_people"] = page("content", header("角色 Characters · fsc-char", 10, TOTAL, right="kit") +
    "".join(g(f"ch-{n}", f"{i * 256} 75 256 645", cell(i * 256, 75, 256, 645, PINK if n == "eve" else PAPER), vline(i * 256 + 253, 72, 648) if i < 4 else "",
              icon(n, i * 256 + 38, 170, 180, lib="fsc-char"), text(i * 256 + 128, 480, n.title(), 28, bold=True, anchor="middle"),
              f'<text x="{i * 256 + 128}" y="520" text-anchor="middle" font-family="{MONO}" font-size="13" fill="{MUTED}">fsc-char/{n}</text>')
            for i, n in enumerate(CHARS)))

OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob("*.svg"):
    f.unlink()
for k, v in S.items():
    (OUT / f"{k}.svg").write_text(v)
print(" ".join([f"fsc-line/{n}" for n in ICONS] + [f"fsc-char/{n}" for n in CHARS]))
