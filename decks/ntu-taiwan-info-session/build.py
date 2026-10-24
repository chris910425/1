"""NTU CCTF 台灣招生說明會 — 學生代表分享（張鈞威），8 頁，約 5 分鐘。

python3 decks/ntu-taiwan-info-session/build.py
  -> svg_output/*.svg   (PPT Master authoring SVGs, also the review renders)

Review: bash .claude/skills/slide-taste/scripts/shoot_svg.sh \
          decks/ntu-taiwan-info-session/svg_output <out_dir>
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from theme import (  # noqa: E402
    CAT, FILL_1, FILL_2, FILL_3, MARGIN, MONO, MUTED, NAVY, NAVY_2, NAVY_3, NAVY_4, NAVY_5,
    PALE, PAPER, RED, RED_PALE, arrow_item, card, cell, claim, doughnut, esc, flight_map, g,
    ghost, hbar, header, hline, img, label, page, para, pin, ttl, txt, vline,
)

OUT = pathlib.Path(__file__).parent / "svg_output"
S = {}

SPEAKER = "張鈞威"
EVENT = "NTU CCTF 台灣招生說明會"
WHEN = "2026 年 ・ 台北"          # TODO 場次日期與地點待確認


# =============================================================================
# 01  封面
# =============================================================================
S["01_cover"] = page("cover",
    g("topband", "0 0 1280 95",
      img("../images/ntu-cctf-lockup-navy.png", MARGIN, 22, 320, 52, "xMidYMid meet"),
      txt(1232, 57, EVENT, 19, weight=700, anchor="end"),
      hline(0, 92, 1280)) +
    g("photo", "0 95 1280 530", img("../images/hive-cover.jpg", 0, 95, 1280, 530), role="background") +
    g("title", "48 168 654 314",
      card(MARGIN, 168, 648, 308),
      ttl(88, 288, "來 NTU 之前，", 72),
      ttl(88, 376, "該知道的事", 72),
      hline(92, 414, 96, col=RED, t=5),
      txt(92, 456, "生活開銷 ・ 課程 ・ 還有我的真心話", 24, fill=MUTED)) +
    g("footband", "0 625 1280 95",
      hline(0, 625, 1280),
      txt(MARGIN, 684, f"{SPEAKER} ・ MSBT 2026 入學", 20, weight=700),
      txt(1232, 684, WHEN, 20, fill=MUTED, anchor="end")))


# =============================================================================
# 02  個人簡介
# =============================================================================
ROWS = ["東吳大學 哲學系", "沒有程式背景", "NTU MSBT 2026 入學", "（目前在做什麼）"]
S["02_about"] = page("content",
    header("個人簡介", 2) +
    g("name", "48 130 640 160",
      ttl(MARGIN, 232, SPEAKER, 84),
      hline(MARGIN, 262, 96, col=RED, t=5)) +
    g("rows", "48 310 640 300",
      *[arrow_item(MARGIN, 352 + i * 62, r, 26,
                   fill=MUTED if r.startswith("（") else NAVY) for i, r in enumerate(ROWS)]) +
    g("portrait", "740 130 492 490",
      card(740, 130, 486, 484, fill=PAPER),
      txt(983, 360, "（個人照片）", 24, fill=NAVY_4, anchor="middle"),
      txt(983, 398, "待提供", 18, fill=NAVY_4, anchor="middle")))


# =============================================================================
# 03  為什麼是新加坡
# =============================================================================
WHY = [
    ("01", "在國際級的職場裡學", ["近年成為亞洲金融中心，", "許多跨國企業把亞洲總部設在這裡。"]),
    ("02", "生活安全、乾淨", ["治安好，公共環境整潔，", "一個人住也放心。"]),
    ("03", "離家 4.5 小時", ["直飛台北，", "想回去隨時可以。"]),
]
route, _pr, A, B = flight_map(716, 118, 516, 470,
                              ("台北", 121.56, 25.03), ("新加坡", 103.85, 1.29))
S["03_why_sg"] = page("content",
    header("為什麼是新加坡", 3) +
    g("reasons", "48 128 640 560",
      *[s for i, (n, t, lines) in enumerate(WHY) for s in (
          hline(MARGIN, 150 + i * 186, 620, col=NAVY_5, t=2) if i else "",
          ghost(MARGIN, 249 + i * 186, n, 54, fill=NAVY_5),
          ttl(132, 232 + i * 186, t, 30),
          para(132, 268 + i * 186, lines, 19),
      )]) +
    g("map", "700 110 532 480", vline(700, 92, 628), route,
      pin(*A, "台北", "left"), pin(*B, "新加坡", "right")) +
    g("duration", "716 596 300 76",
      label(720, 614, "台北 → 新加坡", 15, fill=MUTED),
      ttl(716, 666, "4.5 小時", 54)))


# =============================================================================
# 04  一個月花多少
# =============================================================================
SPEND = [("房租", 1200.00), ("食物", 469.34), ("飲品", 62.65),
         ("交通", 61.71), ("點心", 46.31), ("網路", 10.00)]
SPEND_TOTAL = sum(v for _, v in SPEND)
RING = CAT
CX, CY = 330, 328

legend = []
for i, (nm, v) in enumerate(SPEND):
    y = 196 + i * 62
    legend += [cell(760, y - 15, 20, 20, RING[i]),
               txt(798, y, nm, 22, weight=700),
               txt(1108, y, f"{v:,.0f}", 22, weight=700, anchor="end", family=MONO),
               txt(1232, y, f"{v / SPEND_TOTAL * 100:.1f}%", 20, fill=MUTED, anchor="end", family=MONO)]

S["04_cost"] = page("content",
    header("生活開銷", 4) +
    g("doughnut", "160 150 340 356",
      doughnut(CX, CY, SPEND, colors=RING),
      ttl(CX, CY + 6, "S$1,850", 50, anchor="middle"),
      txt(CX, CY + 44, "每月支出", 20, fill=MUTED, anchor="middle")) +
    g("divider", "720 92 4 628", vline(720, 92, 628)) +
    g("legend", "756 162 484 360", *legend) +
    g("fx", "160 520 440 84",
      txt(CX, 540, "1 SGD ≈ 25.5 TWD", 19, fill=MUTED, anchor="middle", family=MONO),
      txt(CX, 580, "≈ NT$47,175", 34, weight=900, anchor="middle")) +
    g("takeaway", "748 580 484 76",
      cell(748, 584, 484, 72, PALE),
      txt(772, 630, "宿舍不一定抽得到，先找房子", 24, weight=700)))


# =============================================================================
# 05  該不該選這個系（1）產業在缺什麼人
# =============================================================================
# MoleDAO, Web3 Hiring Market Report Q3 2026 — share of postings vs share of applications
GAPS = [("合規・法務・風控", 7.5, 2.3, RED), ("工程", 27.2, 22.4, NAVY)]
FACTS = [
    ("新加坡 134 個職缺", "美國（533）以外最多"),
    ("60 個職缺要中文", "集中在香港、新加坡、台灣"),
    ("台灣也在走同一條路", "虛擬資產服務法已三讀，VASP 改許可制"),
]
SCALE = 30.0  # bars are drawn against 0–30%

bars = []
for i, (nm, post, appl, col) in enumerate(GAPS):
    y = 240 + i * 170
    bars += [txt(MARGIN, y, nm, 24, weight=700),
             txt(MARGIN, y + 44, "職缺", 17, fill=MUTED),
             hbar(110, y + 26, 440, post / SCALE, col),
             txt(566, y + 46, f"{post}%", 26, weight=900, fill=col),
             txt(MARGIN, y + 94, "應徵", 17, fill=MUTED),
             hbar(110, y + 76, 440, appl / SCALE, NAVY_4),
             txt(566, y + 96, f"{appl}%", 26, weight=900, fill=NAVY_3)]

S["05_market"] = page("content",
    header("該不該選這個系", 5) +
    g("claim", "48 110 700 98", claim(MARGIN, 182, "工程的缺最多，合規的缺最沒人補", 40)) +
    g("bars", "48 212 696 336", *bars) +
    g("ratio", "48 556 696 48",
      cell(MARGIN, 556, 696, 48, PALE),
      txt(72, 586, "合規：職缺是應徵的 3.3 倍　|　工程：1.2 倍", 21, weight=700)) +
    g("divider", "756 92 4 628", vline(756, 92, 628)) +
    g("facts", "772 110 460 488",
      *[s for i, (t, sub) in enumerate(FACTS) for s in (
          hline(796, 150 + i * 150, 436, col=NAVY_5, t=2) if i else "",
          ttl(796, 214 + i * 150, t, 26),
          txt(796, 250 + i * 150, sub, 19, fill=MUTED),
      )]) +
    g("token", "772 600 460 60",
      txt(796, 622, "傳統金融正在把資產搬上鏈", 22, weight=700),
      txt(796, 652, "Tokenization — 這個缺口只會更大", 19, fill=MUTED)) +
    g("source", "48 676 696 30",
      txt(MARGIN, 694, "資料：MoleDAO, Web3 Hiring Market Report Q3 2026", 15, fill=MUTED)))


# =============================================================================
# 06  該不該選這個系（2）能學到什麼
# =============================================================================
# Course names exactly as the official syllabus lists them
# (source/msbt-course-content.pdf). Lines are wrapped by hand to fit the cell.
CORE = [["Introduction to Blockchain", "Technology I & II"], ["Distributed Systems"],
        ["Introduction to Cryptography"], ["Software Engineering"],
        ["Blockchain Development", "Fundamentals I & II"],
        ["Blockchain and Smart", "Contract Security"],
        ["Blockchain Privacy and", "Scalability"]]
DEV = [["Web Programming Basics"], ["Blockchain Solutions and", "Smart Contracts"],
       ["Development of", "Decentralized Applications"], ["Software Project Management"],
       ["Introduction to Cyber Security"], ["Game Theory and Blockchain"]]
MGMT = [["Token Economics"], ["Emerging Topics in FinTech"], ["Blockchain Business Applications"],
        ["Ethics and Laws in Blockchain"], ["Blockchain in Finance"]]
BOXES = [("必修 9 門", CORE, FILL_1, 48, 480),
         ("選修・開發 6 門", DEV, FILL_2, 448, 480),
         ("選修・管理與金融 5 門", MGMT, FILL_3, 848, 330)]

cols = []
for title_, items, fill, x, h in BOXES:
    cols += [cell(x, 220, 384, h, fill), cell(x, 220, 384, h, "none", stroke=NAVY),
             ttl(x + 24, 266, title_, 24), hline(x + 24, 284, 48, col=NAVY, t=4)]
    iy = 334
    for lines in items:
        for ln in lines:
            cols.append(txt(x + 24, iy, ln, 20))
            iy += 26
        iy += 10

S["06_courses"] = page("content",
    header("該不該選這個系", 6) +
    g("claim", "48 108 700 96", claim(MARGIN, 180, "必修打底，選修決定你變成什麼人")) +
    g("columns", "48 212 1184 496", *cols) +
    g("qr", "848 568 384 136",
      cell(848, 572, 128, 128, PAPER, stroke=NAVY),
      img("../images/qr-course-content.png", 854, 578, 116, 116, "xMidYMid meet"),
      txt(996, 630, "掃描看完整", 20, weight=700),
      txt(996, 662, "官方課程大綱", 20, weight=700)))


# =============================================================================
# 07  結語
# =============================================================================
S["07_closing"] = page("section",
    g("mark", "0 0 1280 92", hline(MARGIN, 90, 1280 - 2 * MARGIN), label(MARGIN, 62, "結語", 20, fill=MUTED)) +
    g("statement", "48 110 1000 380",
      txt(MARGIN, 212, "有人說新加坡很無聊。", 26, fill=MUTED),
      ttl(MARGIN, 318, "它不是拿來玩的地方，", 60),
      ttl(MARGIN, 398, "是拿來工作的地方。", 60),
      hline(MARGIN, 440, 96, col=RED, t=5)) +
    g("opportunity", "48 500 1184 150",
      cell(MARGIN, 500, 1184, 150, PALE),
      ttl(80, 566, "我來這裡買到的，是原本拿不到的機會。", 32),
      txt(80, 612, "實習、課外活動、認識的人，以及在國際職場工作的機會。", 21, fill=NAVY_2)))


# =============================================================================
# 08  聯絡資訊
# =============================================================================
QRS = [("LINKEDIN", "qr-linkedin.png", 48), ("LINE", "qr-line.png", 244)]
S["08_contact"] = page("content",
    g("photo", "640 0 640 720", img("../images/hive-interior.jpg", 640, 0, 640, 720),
      role="background") +
    g("panel", "0 0 640 720",
      cell(0, 0, 640, 720, PAPER), vline(640, 0, 720),
      img("../images/ntu-cctf-lockup-navy.png", MARGIN, 56, 300, 49, "xMinYMid meet"),
      ttl(MARGIN, 232, "謝謝聆聽", 64),
      hline(MARGIN, 268, 96, col=RED, t=5),
      txt(MARGIN, 318, f"{SPEAKER} ・ NTU MSBT", 24, weight=700),
      *[s for name, f, x in QRS for s in (
          cell(x, 380, 168, 168, PAPER, stroke=NAVY),
          img(f"../images/{f}", x + 8, 388, 152, 152, "xMidYMid meet"),
          label(x, 582, name, 15, fill=MUTED),
      )],
      txt(MARGIN, 664, "有問題歡迎現在提問，或會後找我。", 20, fill=MUTED)))


# =============================================================================
OUT.mkdir(exist_ok=True)
for f in OUT.glob("*.svg"):
    f.unlink()
for name, svg in S.items():
    (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")
print(f"wrote {len(S)} slides -> {OUT}")
