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
    MARGIN, MONO, MUTED, NAVY, NAVY_2, NAVY_3, NAVY_4, NAVY_5, PALE, PAPER, RED, RED_PALE,
    arrow_item, card, cell, claim, doughnut, esc, g, ghost, hbar, header, hline, img, label,
    page, para, sg_outline, ttl, txt, vline,
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
    header("個人簡介", 2, right="ABOUT ME") +
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
island, isl_h = sg_outline(740, 360, 470)
NTU_PIN = (796, 491)          # NTU sits on the west of the island (103.683E, 1.348N)
S["03_why_sg"] = page("content",
    header("為什麼是新加坡", 3, right="WHY SINGAPORE") +
    g("reasons", "48 128 640 560",
      *[s for i, (n, t, lines) in enumerate(WHY) for s in (
          hline(MARGIN, 150 + i * 186, 620, col=NAVY_5, t=2) if i else "",
          ghost(MARGIN, 232 + i * 186, n, 54, fill=NAVY_5),
          ttl(128, 232 + i * 186, t, 30),
          para(128, 268 + i * 186, lines, 19),
      )]) +
    g("map", "700 120 540 540",
      vline(700, 92, 628),
      island,
      f'<path d="M1246 146 C1150 230, 960 300, {NTU_PIN[0] + 6} {NTU_PIN[1] - 4}" fill="none" '
      f'stroke="{RED}" stroke-width="3" stroke-dasharray="9 7" stroke-linecap="round"/>',
      txt(1232, 124, "台北", 22, weight=700, anchor="end"),
      txt(1232, 156, "直飛 4.5 小時", 21, fill=RED, weight=900, anchor="end"),
      f'<circle cx="{NTU_PIN[0]}" cy="{NTU_PIN[1]}" r="8" fill="{RED}" stroke="{PAPER}" stroke-width="3"/>',
      txt(NTU_PIN[0] + 18, NTU_PIN[1] + 6, "NTU", 20, fill=RED, weight=900),
      label(1210, 360 + isl_h + 36, "新加坡", 17, fill=NAVY_4, anchor="end")))


# =============================================================================
# 04  一個月花多少
# =============================================================================
SPEND = [("房租", 1200.00), ("食物", 469.34), ("飲品", 62.65),
         ("交通", 61.71), ("點心", 46.31), ("網路", 10.00)]
SPEND_TOTAL = sum(v for _, v in SPEND)
RING = [RED, NAVY, NAVY_2, NAVY_3, NAVY_4, NAVY_5]
CX, CY = 330, 390

legend = []
for i, (nm, v) in enumerate(SPEND):
    y = 234 + i * 62
    legend += [cell(760, y - 15, 20, 20, RING[i]),
               txt(798, y, nm, 22, weight=700),
               txt(1108, y, f"{v:,.0f}", 22, weight=700, anchor="end", family=MONO),
               txt(1232, y, f"{v / SPEND_TOTAL * 100:.1f}%", 20, fill=MUTED, anchor="end", family=MONO)]

S["04_cost"] = page("content",
    header("生活開銷", 4, right="COST OF LIVING") +
    g("claim", "48 128 660 90", claim(MARGIN, 182, "房租就吃掉三分之二")) +
    g("doughnut-wrap", "160 232 340 316", doughnut("spend", CX, CY, SPEND)) +
    g("centre", "230 360 200 80",
      ttl(CX, CY + 6, "S$1,850", 50, anchor="middle"),
      txt(CX, CY + 44, "每月支出", 20, fill=MUTED, anchor="middle")) +
    g("legend", "723 92 557 628", vline(720, 92, 628), *legend) +
    g("fx", "160 582 440 70",
      txt(CX, 596, "1 SGD ≈ 25.5 TWD", 19, fill=MUTED, anchor="middle", family=MONO),
      txt(CX, 634, "≈ NT$47,175", 30, weight=900, anchor="middle")) +
    g("takeaway", "740 590 492 70",
      cell(748, 590, 484, 70, PALE),
      txt(772, 624, "宿舍不一定抽得到，先找房子", 24, weight=700)) +
    g("note", "740 676 492 30",
      txt(1232, 694, "不含學費、機票與保險", 15, fill=MUTED, anchor="end")))


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
    y = 228 + i * 170
    bars += [txt(MARGIN, y, nm, 24, weight=700),
             txt(MARGIN, y + 44, "職缺", 17, fill=MUTED),
             hbar(110, y + 26, 440, post / SCALE, col),
             txt(566, y + 46, f"{post}%", 26, weight=900, fill=col),
             txt(MARGIN, y + 94, "應徵", 17, fill=MUTED),
             hbar(110, y + 76, 440, appl / SCALE, NAVY_4),
             txt(566, y + 96, f"{appl}%", 26, weight=900, fill=NAVY_3)]

S["05_market"] = page("content",
    header("該不該選這個系", 5, right="JOB MARKET") +
    g("claim", "48 128 700 90", claim(MARGIN, 182, "工程的缺最多，合規的缺最沒人補", 40)) +
    g("bars", "48 210 620 320", *bars) +
    g("ratio", "48 556 696 48",
      cell(MARGIN, 556, 696, 48, PALE),
      txt(72, 586, "合規：職缺是應徵的 3.3 倍　|　工程：1.2 倍", 21, weight=700)) +
    g("facts", "772 128 460 470",
      vline(756, 92, 628),
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
COLS = [
    ("必修 9 門", "打底", PAPER,
     ["區塊鏈技術 1 & 2", "分散式系統", "密碼學", "軟體工程", "區塊鏈開發 1 & 2",
      "智能合約安全", "隱私與擴容"], []),
    ("選修・開發 6 門", "ELECTIVE", PAPER,
     ["Web 程式基礎", "智能合約方案", "dApp 開發", "軟體專案管理", "資訊安全", "賽局理論"], []),
    ("選修・管理與金融 5 門", "ELECTIVE", PALE,
     ["代幣經濟", "FinTech 新趨勢", "區塊鏈商業應用", "區塊鏈倫理與法律", "區塊鏈與金融"],
     [3, 4]),
]
cols = []
for i, (ttl_, kick, fill, items, hot) in enumerate(COLS):
    x = MARGIN + i * 396
    w = 380
    cols += [cell(x, 206, w, 310, fill),
             cell(x, 206, w, 310, "none", stroke=NAVY),
             ttl(x + 24, 252, ttl_, 24),
             hline(x + 24, 270, 48, col=NAVY_4, t=4)]
    for j, it in enumerate(items):
        iy = 310 + j * 29
        on = j in hot
        cols += [txt(x + 24, iy, ("● " if on else "・ ") + it, 18,
                     fill=RED if on else NAVY, weight=700 if on else 400)]

S["06_courses"] = page("content",
    header("該不該選這個系", 6, right="COURSES") +
    g("claim", "48 128 900 90", claim(MARGIN, 182, "必修打底，選修決定你變成什麼人")) +
    g("columns", "48 206 1184 310", *cols) +
    g("pick", "48 536 760 64",
      txt(MARGIN, 560, "● 我自己會選的兩門", 19, fill=RED, weight=700),
      txt(MARGIN, 592, "市場最缺合規人才，所以我往法律和金融的課走。", 21, weight=700)) +
    g("time", "48 626 760 70",
      hline(MARGIN, 626, 760, col=NAVY_5, t=2),
      ttl(MARGIN, 684, "18:30 – 21:45", 34),
      txt(300, 684, "課大多排在晚上，白天可以去實習。", 20, fill=MUTED)) +
    g("qr", "1000 530 232 170",
      card(1046, 530, 130, 130, fill=PAPER, shadow=0),
      img("../images/qr-course-content.png", 1052, 536, 118, 118, "xMidYMid meet"),
      txt(1111, 686, "掃這裡看完整課程大綱", 17, fill=MUTED, anchor="middle")))


# =============================================================================
# 07  結語
# =============================================================================
S["07_closing"] = page("statement",
    g("mark", "0 0 1280 92", hline(MARGIN, 90, 1280 - 2 * MARGIN), label(MARGIN, 62, "結語", 20, fill=MUTED)) +
    g("statement", "48 150 1000 380",
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
CONTACT = [("EMAIL", "（待填）"), ("LINKEDIN", "（待填）"), ("INSTAGRAM", "（待填）")]
S["08_contact"] = page("closing",
    g("photo", "640 0 640 720", img("../images/hive-cover.jpg", 640, 0, 640, 720), role="background") +
    g("panel", "0 0 640 720",
      cell(0, 0, 640, 720, PAPER), vline(640, 0, 720),
      img("../images/ntu-cctf-lockup-navy.png", MARGIN, 60, 300, 49, "xMinYMid meet"),
      ttl(MARGIN, 268, "謝謝聆聽", 68),
      hline(MARGIN, 306, 96, col=RED, t=5),
      txt(MARGIN, 356, f"{SPEAKER} ・ NTU MSBT", 24, weight=700),
      *[s for i, (k, v) in enumerate(CONTACT) for s in (
          hline(MARGIN, 410 + i * 72, 544, col=NAVY_5, t=2),
          label(MARGIN, 444 + i * 72, k, 13),
          txt(200, 448 + i * 72, v, 21, weight=700),
      )],
      txt(MARGIN, 668, "有問題歡迎現在提問，或會後找我。", 20, fill=MUTED)))


# =============================================================================
OUT.mkdir(exist_ok=True)
for f in OUT.glob("*.svg"):
    f.unlink()
for name, svg in S.items():
    (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")
print(f"wrote {len(S)} slides -> {OUT}")
