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
    ghost, hbar, header, hline, img, label, legend_row, lockup, orchid, page, para, pin,
    ttl, txt, vbars, vline,
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
      lockup(MARGIN, 16, 56),
      txt(1232, 57, EVENT, 19, weight=700, anchor="end"),
      hline(0, 92, 1280)) +
    g("photo", "0 95 1280 530", img("../images/hive-cover.jpg", 0, 95, 1280, 530), role="background") +
    g("title", "48 168 654 314",
      card(MARGIN, 168, 648, 308),
      ttl(88, 276, "在新加坡", 72),
      ttl(88, 362, "念書這一年", 72),
      txt(92, 416, "花多少錢，念什麼課，", 24, fill=MUTED),
      txt(92, 450, "還有我會不會推薦你來", 24, fill=MUTED)) +
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
      ttl(MARGIN, 232, SPEAKER, 84)) +
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
    ("01", "公司總部都設在這", ["近年成為亞洲金融中心，", "許多跨國企業把亞洲總部設在這裡。"]),
    ("02", "晚上一個人走路不用怕", ["公共環境也乾淨。"]),
    ("03", "飛 4.5 小時到家", []),
]
route, _pr, A, B = flight_map(716, 124, 516, 532,
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
    g("map", "700 110 532 560", vline(700, 92, 628), route,
      pin(*A, "台北", "left"), pin(*B, "新加坡", "right")))


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
      txt(772, 630, "宿舍很難抽，早點找房", 24, weight=700)))


# =============================================================================
# 05  該不該選這個系（1）產業在缺什麼人
# =============================================================================
# MoleDAO, Web3 Hiring Market Report Q3 2026 — one sample only (the Moledao
# platform's Q3 postings and applications). Shares are of ALL postings and ALL
# applications, so the three groups shown here are part of a larger set.
JOBS = ["合規・法務・風控", "工程", "行銷・成長"]
SERIES = [("職缺", RED, [7.5, 27.2, 7.9]), ("應徵", NAVY, [2.3, 22.4, 20.8])]
# Singapore's own push, for the variant that keeps a right-hand column
SG_POLICY = [
    ("Project Guardian", ["資產代幣化試點，", "40 多家金融機構參與"]),
    ("Global Layer One", ["金融機構共建的", "共享帳本基礎設施"]),
    ("穩定幣監管框架", ["單一貨幣穩定幣的", "發行與儲備規範"]),
]
SOURCE = "資料：MoleDAO, Web3 Hiring Market Report Q3 2026"


def market_page(wide: bool):
    """wide=True lets the chart fill the slide; wide=False keeps the policy column."""
    cw = 1184 if wide else 668
    body = (header("該不該選這個系", 5) +
            g("claim", "48 106 700 86", claim(MARGIN, 172, "合規的缺，沒人去投", 44)) +
            g("legend", "48 194 660 44",
              legend_row(MARGIN, 218, SERIES),
              txt(MARGIN + 300, 218, "占平台全部職缺／全部應徵的比例", 16, fill=MUTED)) +
            g("chart", f"48 242 {cw} 412",
              vbars(92, 258, cw - 60, 336, JOBS, SERIES, 30)) +
            g("source", "48 666 696 34", txt(MARGIN, 690, SOURCE, 15, fill=MUTED)))
    if not wide:
        body += (g("divider", "756 92 4 628", vline(756, 92, 628)) +
                 g("policy", "772 150 460 530",
                   label(796, 186, "新加坡正在推的", 15, fill=MUTED),
                   *[s for i, (t, lines) in enumerate(SG_POLICY) for s in (
                       hline(796, 232 + i * 152, 436, col=NAVY_5, t=2) if i else "",
                       ttl(796, 294 + i * 152, t, 25),
                       para(796, 330 + i * 152, lines, 19),
                   )]))
    return page("content", body)


S["05_market"] = market_page(wide=False)


# =============================================================================
# 06  該不該選這個系（2）能學到什麼
# =============================================================================
# Course codes and names exactly as the official syllabus lists them
# (source/msbt-course-content.pdf). Lines are wrapped by hand to fit the cell.
CORE = [("SC6101–02", ["Introduction to Blockchain", "Technology I & II"]),
        ("SC6103", ["Distributed Systems"]),
        ("SC6104", ["Introduction to", "Cryptography"]),
        ("SC6105", ["Software Engineering"]),
        ("SC6106–07", ["Blockchain Development", "Fundamentals I & II"]),
        ("SC6108", ["Blockchain and Smart", "Contract Security"]),
        ("SC6109", ["Blockchain Privacy and", "Scalability"])]
DEV = [("SC6111", ["Web Programming Basics"]),
       ("SC6112", ["Blockchain Solutions and", "Smart Contracts"]),
       ("SC6113", ["Development of", "Decentralized Applications"]),
       ("SC6114", ["Software Project", "Management"]),
       ("SC6115", ["Introduction to", "Cyber Security"]),
       ("SC6116", ["Game Theory and", "Blockchain"])]
MGMT = [("SC6121", ["Token Economics"]),
        ("SC6122", ["Emerging Topics in", "FinTech"]),
        ("SC6123", ["Blockchain Business", "Applications"]),
        ("SC6124", ["Ethics and Laws in", "Blockchain"]),
        ("SC6125", ["Blockchain in Finance"])]
BOXES = [("必修 9 門", CORE, FILL_1, 48), ("選修・開發 6 門", DEV, FILL_2, 448),
         ("選修・管理與金融 5 門", MGMT, FILL_3, 848)]
BOX_Y, BOX_H = 204, 480

cols = []
for title_, items, fill, x in BOXES:
    cols += [cell(x, BOX_Y, 384, BOX_H, fill), cell(x, BOX_Y, 384, BOX_H, "none", stroke=NAVY),
             ttl(x + 24, BOX_Y + 46, title_, 24), hline(x + 24, BOX_Y + 64, 48, col=NAVY, t=4)]
    iy = BOX_Y + 118
    for code, lines in items:
        cols.append(txt(x + 24, iy, code, 15, fill=NAVY_3, weight=700, family=MONO))
        for ln in lines:
            cols.append(txt(x + 114, iy, ln, 19))
            iy += 25
        iy += 10

S["06_courses"] = page("content",
    header("該不該選這個系", 6) +
    g("claim", "48 104 760 92", claim(MARGIN, 168, "必修都一樣，差別在選修", 40)) +
    g("columns", "48 200 1184 492", *cols,
      cell(984, 556, 112, 112, PAPER, stroke=NAVY),
      img("../images/qr-course-content.png", 989, 561, 102, 102, "xMidYMid meet")))


# =============================================================================
# 08  聯絡資訊
# =============================================================================
QRS = [("LINKEDIN", "qr-linkedin.png", 48), ("LINE", "qr-line.png", 244)]
S["08_contact"] = page("content",
    g("photo", "640 0 640 720", img("../images/hive-interior.jpg", 640, 0, 640, 720),
      role="background") +
    g("panel", "0 0 640 720",
      cell(0, 0, 640, 720, PAPER), vline(640, 0, 720),
      lockup(MARGIN, 52, 54),
      ttl(MARGIN, 232, "謝謝聆聽", 64),
      txt(MARGIN, 318, f"{SPEAKER} ・ NTU MSBT", 24, weight=700),
      *[s for name, f, x in QRS for s in (
          cell(x, 380, 168, 168, PAPER, stroke=NAVY),
          img(f"../images/{f}", x + 8, 388, 152, 152, "xMidYMid meet"),
          label(x, 582, name, 15, fill=MUTED),
      )],
      txt(MARGIN, 664, "有問題歡迎現在提問，或會後找我。", 20, fill=MUTED)))


# =============================================================================
# Alternates for the user to choose from (not part of the deck itself)
# =============================================================================
ALT = {}


def closing(variant):
    """Three ways to build a closing plate out of Vanda Miss Joaquim, Singapore's
    national flower, in Raw Grid's language: cells that meet without gaps, 3px
    lines, hard offset shadows, the deck's two quiet fills."""
    if variant == "A":      # a specimen row: three cells along the foot, one spray each
        fills = [PALE, PAPER, FILL_3]
        cells = [s for i, f in enumerate(fills) for s in (
            cell(i * 427, 452, 427 if i < 2 else 426, 268, f),
            vline(i * 427, 452, 268) if i else "",
            orchid(i * 427 + 118, 478, 224, ink=NAVY_3, petal=PAPER,
                   lip=PALE if i != 0 else PAPER),
        )]
        return page("section",
            g("row", "0 450 1280 270", hline(0, 452, 1280), *cells, role="decoration") +
            g("word", "440 268 400 170", ttl(640, 392, "結語", 128, anchor="middle")))

    if variant == "B":      # two sprays breaking in from opposite corners, word on a card
        return page("section",
            g("flower", "0 0 1280 720",
              orchid(-110, -40, 520, ink=NAVY_5, petal=PAPER, lip=PAPER),
              f'<g transform="translate(1390 760) rotate(180)">'
              f'{orchid(0, 0, 600, ink=NAVY_5, petal=PAPER, lip=PAPER)}</g>',
              role="decoration") +
            g("word", "410 280 460 170",
              card(410, 280, 456, 164, fill=PAPER),
              ttl(638, 396, "結語", 112, anchor="middle")))

    # C: a pale band cuts the page and the sprays break out of it, top and bottom
    return page("section",
        g("band", "0 256 1280 208",
          cell(0, 256, 1280, 208, PALE), hline(0, 256, 1280), hline(0, 461, 1280)) +
        g("right", "860 120 420 540",
          orchid(900, 132, 560, ink=NAVY_3, petal=PAPER, lip=PALE), role="decoration") +
        g("left", "20 150 340 500",
          f'<g transform="translate(340 168) scale(-1 1)">'
          f'{orchid(0, 0, 452, ink=NAVY_4, petal=PAPER, lip=PALE)}</g>', role="decoration") +
        g("word", "440 290 400 150", ttl(640, 396, "結語", 116, anchor="middle")))


for v in ("A", "B", "C"):
    ALT[f"07_closing_{v}"] = closing(v)
S["07_closing"] = ALT["07_closing_A"]

ALTDIR = pathlib.Path(__file__).parent / "alts"
ALTDIR.mkdir(exist_ok=True)
for f in ALTDIR.glob("*.svg"):
    f.unlink()
for name, svg in ALT.items():
    (ALTDIR / f"{name}.svg").write_text(svg, encoding="utf-8")
(ALTDIR / "05_market_wide.svg").write_text(market_page(wide=True), encoding="utf-8")

OUT.mkdir(exist_ok=True)
for f in OUT.glob("*.svg"):
    f.unlink()
for name, svg in S.items():
    (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")
print(f"wrote {len(S)} slides -> {OUT}")
