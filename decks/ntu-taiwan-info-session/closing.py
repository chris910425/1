"""Five closing plates built from the Peranakan-batik reference.

python3 decks/ntu-taiwan-info-session/closing.py -> alts/07_closing_1..5.svg
"""
import pathlib
import random
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
import batik as B  # noqa: E402
from theme import (  # noqa: E402
    FILL_3, NAVY, PALE, PAPER, cell, g, hline, page, ttl, vline,
)

CREAM = "#F7E9D9"
PAL = B.PALETTE_DARK                      # on a dark ground
PAL_LIGHT = dict(PAL, pale="#8FB7D4")     # pale blue needs more body on white
OUT = HERE / "alts"
WORD_BOX = (470, 330, 810, 470)           # the zone the flowers stay out of


def word(fill=NAVY, y=452, size=132, cx=640):
    return ttl(cx, y, "結語", size, fill=fill, anchor="middle")


# --- 1  navy field: a packed crown, a few vines falling out of it -------------
def v1():
    r = random.Random(7)
    keep = (486, 486, 800, 660)              # the word's own air
    # four long falls kept to the sides, one short one in the middle that stops high
    falls = ((((214, 248), (104, 400), (286, 486), (176, 650)), 6),
             ((((400, 266), (474, 392), (356, 470), (430, 588))), 5),
             ((((886, 242), (806, 386), (962, 470), (872, 664))), 6),
             ((((1092, 262), (1176, 384), (1030, 452), (1116, 596))), 5),
             ((((654, 228), (626, 286), (672, 318), (648, 372))), 3))
    return page("section",
        g("ground", "0 0 1280 720", cell(0, 0, 1280, 720, NAVY), role="background") +
        g("falls", "0 210 1280 480",
          *[B.tendril(r, PAL, *f, n=n, r0=28, keep_out=keep) for f, n in falls],
          role="decoration") +
        g("crown", "0 -60 1280 340",
          B.canopy_mat(r, PAL, (-50, -66, 1330, 318), mesh=13, cell=61,
                       fade_from=0.44, r0=30), role="decoration") +
        g("word", "440 498 400 180", word(CREAM, 614)), bg=NAVY)


# --- 2  white page: vines hang in from both top corners -----------------------
def v2():
    r = random.Random(11)
    return page("section",
        g("left", "0 0 470 720",
          B.garden(r, PAL_LIGHT, (-120, -80, 470, 760), keep_out=WORD_BOX,
                   vines=4, per_vine=8, r0=36), role="decoration") +
        g("right", "810 0 470 720",
          B.garden(r, PAL_LIGHT, (810, -80, 1400, 760), keep_out=WORD_BOX,
                   vines=4, per_vine=8, r0=36), role="decoration") +
        g("word", "470 326 340 182", word(NAVY)))


# --- 3  a navy band cuts the page, the garden grows out of it -----------------
def v3():
    r = random.Random(23)
    return page("section",
        g("band", "0 252 1280 216",
          cell(0, 252, 1280, 216, NAVY), hline(0, 252, 1280), hline(0, 465, 1280)) +
        g("garden", "0 120 1280 600",
          B.garden(r, PAL, (-40, 130, 1320, 660), keep_out=(410, 276, 880, 462),
                   vines=5, per_vine=9, r0=34), role="decoration") +
        g("word", "440 296 400 160", word(CREAM, 400, 116)))


# --- 4  Raw Grid: three cells along the foot, a colourway each ----------------
def v4():
    out = []
    for i, (f, sd) in enumerate(zip((NAVY, PALE, FILL_3), (3, 5, 9))):
        r = random.Random(sd)
        x, w = i * 427, (427 if i < 2 else 426)
        pal = PAL if f == NAVY else dict(PAL, pale=NAVY, sand=PAPER)
        out += [cell(x, 452, w, 268, f),
                B.garden(r, pal, (x + 4, 456, x + w - 4, 716), vines=3, per_vine=6,
                         r0=28, bleed=18),
                vline(x, 452, 268) if i else ""]
    return page("section",
        g("row", "0 450 1280 270", hline(0, 452, 1280), *out, role="decoration") +
        g("word", "440 266 400 178", word(NAVY, 392, 128)))


# --- 5  garlands along the head and the foot, the middle kept open ------------
def v5():
    r = random.Random(41)
    return page("section",
        g("top", "0 0 1280 210",
          B.garden(r, PAL_LIGHT, (-60, -60, 1340, 210), vines=3, per_vine=10, r0=34),
          role="decoration") +
        g("foot", "0 520 1280 200",
          B.garden(r, PAL_LIGHT, (-60, 520, 1340, 790), vines=3, per_vine=10, r0=34),
          role="decoration") +
        g("word", "470 326 340 182", word(NAVY)))


PLATES = (v1, v2, v3, v4, v5)
CHOSEN = 2                      # which plate the deck uses; change to pick another

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for i, fn in enumerate(PLATES, 1):
        (OUT / f"07_closing_{i}.svg").write_text(fn(), encoding="utf-8")
    print("wrote 5 closing plates ->", OUT)
