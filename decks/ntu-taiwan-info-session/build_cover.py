"""Cover drafts for the NTU Taiwan info-session deck (Raw Grid + CCTF colours + the Hive).

python3 decks/ntu-taiwan-info-session/build_cover.py  -> draft-cover/*.svg
Render:  bash .claude/skills/slide-taste/scripts/render.sh decks/ntu-taiwan-info-session/draft-cover <out>
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "templates" / "rawgrid" / "kit"))
from rawgrid import esc, page, hline, vline, cell, card, text, label  # noqa: E402

OUT = pathlib.Path(__file__).parent / "draft-cover"

# Raw Grid tokens restated in CCTF colours: ink -> deep navy, paper -> white,
# the two pastels -> NTU red tint + CCTF pale blue, accent -> NTU red.
NAVY = "#0A1138"
RED = "#D21540"
PALE = "#CBE0EC"
WHITE = "#FFFFFF"
TITLE_F = "Noto Sans TC"
BG = "../images/hive-cover-bg.jpg"
LOCKUP = "../images/ntu-cctf-lockup.png"

T_MAIN = "來 NTU 之前，該知道的事"
T_SUB = "生活開銷 ・ 課程 ・ 還有我的真心話"
T_EVENT = "NTU CCTF 台灣招生說明會"
T_WHO = "（你的名字）・ MSBT 2026 入學"
T_WHEN = "2026 年 ・ 台北"


def img(href, x, y, w, h, preserve="xMidYMid slice"):
    return (f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" '
            f'preserveAspectRatio="{preserve}"/>')


def ttl(x, y, s, size=66, fill=WHITE, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    return (f'<text x="{x}" y="{y}" font-family="{TITLE_F}" font-weight="900" '
            f'font-size="{size}" fill="{fill}"{a}>{esc(s)}</text>')


def g(gid, bounds, *parts, role=None):
    r = f' data-pptx-role="{role}"' if role else ""
    return (f'  <g id="{gid}" data-pptx-bounds="{bounds}"{r}>\n    '
            + "\n    ".join(p for p in parts if p) + "\n  </g>\n")


# --- A: faithful to the reference -------------------------------------------------
# full-bleed photo, centred title on one rule, bordered event box, red block at the foot
A_TITLE_W = 820
A = page("cover",
    g("photo", "0 0 1280 720", img(BG, 0, 0, 1280, 720), role="background") +
    g("lockup", "48 40 320 52", img(LOCKUP, 48, 40, 320, 52, "xMidYMid meet")) +
    g("rule", "48 330 1184 3",
      hline(48, 330, (1280 - A_TITLE_W) // 2 - 76, col=WHITE),
      hline(1280 - 48 - ((1280 - A_TITLE_W) // 2 - 76), 330, (1280 - A_TITLE_W) // 2 - 76, col=WHITE)) +
    g("title", "230 270 820 150",
      ttl(640, 356, T_MAIN, 66, anchor="middle"),
      hline(594, 408, 92, col=RED, t=4),
      text(640, 456, T_SUB, 24, fill=PALE, anchor="middle")) +
    g("event", "490 520 300 64",
      f'<rect x="490" y="520" width="300" height="64" fill="none" stroke="{WHITE}" stroke-width="3"/>',
      text(640, 560, T_EVENT, 21, fill=WHITE, bold=True, anchor="middle")) +
    g("who", "48 630 500 50",
      text(48, 652, T_WHO, 19, fill=WHITE), text(48, 684, T_WHEN, 19, fill=PALE)) +
    g("next", "1180 630 52 52",
      f'<rect x="1186" y="636" width="52" height="52" fill="{NAVY}"/>',
      f'<rect x="1180" y="630" width="52" height="52" fill="{RED}"/>',
      f'<path d="M1192 648 L1206 664 L1220 648" fill="none" stroke="{WHITE}" stroke-width="4"/>'),
    bg=NAVY)

# --- B: the reference rebuilt in Raw Grid structure --------------------------------
# the photo is one cell of a white 3px grid; title block sits in a navy cell with a hard shadow
B = page("cover",
    g("photo", "0 0 1280 720", img(BG, 0, 0, 1280, 720), role="background") +
    g("grid", "0 92 1280 536",
      hline(0, 92, 1280, col=WHITE), hline(0, 628, 1280, col=WHITE), vline(880, 92, 536, col=WHITE)) +
    g("lockup", "48 24 320 52", img(LOCKUP, 48, 24, 320, 52, "xMidYMid meet")) +
    g("title", "48 150 800 400",
      ttl(48, 300, "來 NTU 之前，", 72), ttl(48, 388, "該知道的事", 72),
      hline(52, 432, 92, col=RED, t=4),
      text(52, 486, T_SUB, 24, fill=PALE)) +
    g("event", "912 150 320 300",
      f'<rect x="918" y="156" width="320" height="104" fill="{NAVY}"/>',
      f'<rect x="912" y="150" width="320" height="104" fill="{WHITE}"/>',
      text(936, 190, "EVENT", 13, fill="#6B6B6B", bold=True),
      text(936, 224, T_EVENT, 19, fill=NAVY, bold=True),
      f'<rect x="912" y="300" width="56" height="56" fill="{RED}"/>',
      f'<path d="M926 318 L940 334 L954 318" fill="none" stroke="{WHITE}" stroke-width="4"/>') +
    g("who", "48 628 1184 92",
      text(48, 678, T_WHO, 20, fill=WHITE),
      text(1232, 678, T_WHEN, 20, fill=PALE, anchor="end")),
    bg=NAVY)

OUT.mkdir(exist_ok=True)
(OUT / "01_cover_A.svg").write_text(A, encoding="utf-8")
(OUT / "02_cover_B.svg").write_text(B, encoding="utf-8")
print("wrote", OUT)
