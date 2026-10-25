"""Peranakan-batik flower motifs, drawn to fit this deck.

Built from the reference the user shared: a deep ground, gold vines beaded with
dots, stylised flowers with dotted rims, and small pointed leaves. The palette is
the deck's own — NTU red, CCTF pale blue, the sand fill, a teal and an ochre gold —
so the plate reads as part of the deck rather than as borrowed clip art.

Every function returns plain SVG with explicit paint, as PPT Master requires.
"""
from __future__ import annotations

import math

GOLD = "#C19A3E"
GOLD_DEEP = "#9C7A22"


# ---- geometry helpers -------------------------------------------------------
def _bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1])


def _tangent(p0, p1, p2, p3, t):
    u = 1 - t
    dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0])
    dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])
    return math.degrees(math.atan2(dy, dx))


def _dots(points, r=1.7, col=GOLD):
    return "".join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{col}"/>' for x, y in points)


# ---- the vine ---------------------------------------------------------------
def vine(p0, p1, p2, p3, w=2.4, col=GOLD, bead=True, step=0.042):
    """One gold stem, beaded with dots the way the batik draws it."""
    out = [f'<path d="M{p0[0]:.1f} {p0[1]:.1f} C{p1[0]:.1f} {p1[1]:.1f} '
           f'{p2[0]:.1f} {p2[1]:.1f} {p3[0]:.1f} {p3[1]:.1f}" fill="none" '
           f'stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>']
    if bead:
        t = step
        pts = []
        while t < 1:
            pts.append(_bez(p0, p1, p2, p3, t))
            t += step
        out.append(_dots(pts, 2.1, col))
    return "".join(out)


def vine_at(p0, p1, p2, p3, t):
    return _bez(p0, p1, p2, p3, t), _tangent(p0, p1, p2, p3, t)


# ---- the flowers ------------------------------------------------------------
def flower_round(cx, cy, r, fill, centre, rot=0, gold=GOLD, n=5):
    """Five rounded petals with a beaded rim and a dotted eye — the red bloom."""
    out = [f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.0f})">']
    for i in range(n):
        a = 360 / n * i
        out.append(f'<ellipse cx="0" cy="{-r * 0.56:.1f}" rx="{r * 0.44:.1f}" ry="{r * 0.56:.1f}" '
                   f'fill="{fill}" stroke="{gold}" stroke-width="1.6" '
                   f'transform="rotate({a:.0f})"/>')
    for i in range(n):
        a = math.radians(360 / n * i)
        out.append(f'<circle cx="{math.sin(a) * r * 0.92:.1f}" cy="{-math.cos(a) * r * 0.92:.1f}" '
                   f'r="1.9" fill="{gold}"/>')
    out.append(f'<circle cx="0" cy="0" r="{r * 0.3:.1f}" fill="{centre}" '
               f'stroke="{gold}" stroke-width="1.4"/>')
    for i in range(6):
        a = math.radians(60 * i)
        out.append(f'<circle cx="{math.sin(a) * r * 0.17:.1f}" cy="{-math.cos(a) * r * 0.17:.1f}" '
                   f'r="1.3" fill="{gold}"/>')
    out.append("</g>")
    return "".join(out)


def flower_star(cx, cy, r, fill, rot=0, gold=GOLD, n=5):
    """Narrow pointed petals with a beaded spine — the blue star."""
    out = [f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.0f})">']
    for i in range(n):
        a = 360 / n * i
        out.append(f'<path d="M0 0 C{r * 0.26:.1f} {-r * 0.42:.1f} {r * 0.2:.1f} {-r * 0.86:.1f} 0 {-r:.1f} '
                   f'C{-r * 0.2:.1f} {-r * 0.86:.1f} {-r * 0.26:.1f} {-r * 0.42:.1f} 0 0 Z" '
                   f'fill="{fill}" stroke="{gold}" stroke-width="1.5" stroke-linejoin="round" '
                   f'transform="rotate({a:.0f})"/>')
        out.append(f'<circle cx="0" cy="{-r * 0.58:.1f}" r="1.4" fill="{gold}" '
                   f'transform="rotate({a:.0f})"/>')
    out.append(f'<circle cx="0" cy="0" r="{r * 0.17:.1f}" fill="{gold}"/></g>')
    return "".join(out)


def flower_bell(cx, cy, r, fill, rot=0, gold=GOLD):
    """A trumpet bud, nodding off its stem — the ochre bell."""
    w, h = r * 0.78, r
    return (f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.0f})">'
            f'<path d="M{-w * 0.22:.1f} {-h:.1f} C{-w * 0.5:.1f} {-h * 0.1:.1f} {-w:.1f} {h * 0.42:.1f} {-w * 0.86:.1f} {h * 0.86:.1f} '
            f'C{-w * 0.3:.1f} {h * 1.06:.1f} {w * 0.3:.1f} {h * 1.06:.1f} {w * 0.86:.1f} {h * 0.86:.1f} '
            f'C{w:.1f} {h * 0.42:.1f} {w * 0.5:.1f} {-h * 0.1:.1f} {w * 0.22:.1f} {-h:.1f} Z" '
            f'fill="{fill}" stroke="{gold}" stroke-width="1.6" stroke-linejoin="round"/>'
            f'<path d="M0 {-h * 0.7:.1f} L0 {h * 0.5:.1f}" stroke="{gold}" stroke-width="1.2"/>'
            f'<circle cx="{-w * 0.44:.1f}" cy="{h * 0.74:.1f}" r="1.7" fill="{gold}"/>'
            f'<circle cx="{w * 0.44:.1f}" cy="{h * 0.74:.1f}" r="1.7" fill="{gold}"/></g>')


def leaf(cx, cy, r, fill, rot=0, gold=GOLD):
    """Pointed leaf with a gold midrib and three beads."""
    w = r * 0.46
    return (f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.0f})">'
            f'<path d="M0 {-r:.1f} C{w:.1f} {-r * 0.4:.1f} {w:.1f} {r * 0.4:.1f} 0 {r:.1f} '
            f'C{-w:.1f} {r * 0.4:.1f} {-w:.1f} {-r * 0.4:.1f} 0 {-r:.1f} Z" '
            f'fill="{fill}" stroke="{gold}" stroke-width="1.5" stroke-linejoin="round"/>'
            f'<path d="M0 {-r * 0.78:.1f} L0 {r * 0.78:.1f}" stroke="{gold}" stroke-width="1.1"/>'
            + "".join(f'<circle cx="{(-1) ** i * w * 0.45:.1f}" cy="{(i - 1) * r * 0.34:.1f}" '
                      f'r="1.3" fill="{gold}"/>' for i in range(3))
            + "</g>")


def quatrefoil(cx, cy, r, fill, rot=0, gold=GOLD):
    """The little four-lobed filler that sits between the big blooms."""
    out = [f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.0f})">']
    for i in range(4):
        out.append(f'<circle cx="0" cy="{-r * 0.5:.1f}" r="{r * 0.5:.1f}" fill="{fill}" '
                   f'stroke="{gold}" stroke-width="1.3" transform="rotate({90 * i})"/>')
    out.append(f'<circle cx="0" cy="0" r="{r * 0.2:.1f}" fill="{gold}"/></g>')
    return "".join(out)


# ---- composition ------------------------------------------------------------
PALETTE_DARK = dict(red="#D21540", pale="#CBE0EC", sand="#F7E9D9",
                    ochre="#C97B10", teal="#0E8276", navy="#0A1138")
KINDS = ("round", "star", "bell", "leaf", "quat")
WEIGHTS = (0.30, 0.26, 0.13, 0.23, 0.08)


def motif(rng, pal, x, y, r, ang):
    k = rng.choices(KINDS, WEIGHTS)[0]
    rot = ang + rng.uniform(-45, 45)
    if k == "round":
        return flower_round(x, y, r, rng.choice((pal["red"], pal["pale"], pal["sand"])),
                            pal["pale"] if rng.random() < .5 else pal["red"], rot)
    if k == "star":
        return flower_star(x, y, r * 1.08, rng.choice((pal["pale"], pal["sand"])), rot)
    if k == "bell":
        return flower_bell(x, y, r * 0.92, pal["ochre"], rot + 90)
    if k == "leaf":
        return leaf(x, y, r * 0.9, pal["teal"], rot + 90)
    return quatrefoil(x, y, r * 0.62, pal["sand"], rot)


def _inside(x, y, box, m=0):
    return box[0] - m <= x <= box[2] + m and box[1] - m <= y <= box[3] + m


def garden(rng, pal, box, keep_out=None, vines=5, per_vine=9, r0=36,
           fade=0.0, bleed=60, keep_pad=34):
    """Fill `box` with crossing beaded vines and blooms, the way the reference does.

    keep_out  a rectangle the flowers stay clear of (the words)
    fade      0 keeps density even; 1 makes the lower edge much sparser
    """
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    out = []
    for i in range(vines):
        f = i / max(vines - 1, 1)
        yc = y0 + h * (0.08 + 0.84 * f)
        amp = h * rng.uniform(0.16, 0.34)
        pts = ((x0 - bleed, yc + rng.uniform(-h * .06, h * .06)),
               (x0 + w * rng.uniform(0.18, 0.34), yc - amp),
               (x0 + w * rng.uniform(0.62, 0.82), yc + amp),
               (x1 + bleed, yc + rng.uniform(-h * .06, h * .06)))
        out.append(vine(*pts))
        n = max(int(per_vine * (1 - fade * f)), 2)
        for j in range(n):
            t = (j + rng.uniform(-0.3, 0.3) + 0.5) / n
            t = min(max(t, 0.02), 0.98)
            (mx, my), ang = vine_at(*pts, t)
            off = rng.uniform(-1, 1) * r0 * 1.1
            mx += math.cos(math.radians(ang + 90)) * off
            my += math.sin(math.radians(ang + 90)) * off
            if not _inside(mx, my, box, bleed * 0.5):
                continue
            if keep_out and _inside(mx, my, keep_out, keep_pad):
                continue
            r = r0 * rng.uniform(0.58, 1.2) * (1 - 0.3 * fade * f)
            out.append(motif(rng, pal, mx, my, r, ang))
    return "".join(out)


# ---- the reference's own shape: a packed crown, a few vines falling out of it --
def canopy_mat(rng, pal, box, mesh=9, cell=68, fade_from=0.52, r0=30):
    """A dense mat of blooms across the top, thinning toward its lower edge, laid
    over a tangle of short vines — the way the reference packs its crown."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    out = []
    for _ in range(mesh):                       # the tangle goes down first
        ax, ay = x0 + rng.uniform(-60, w + 60), y0 + rng.uniform(0, h * 0.9)
        L = rng.uniform(w * 0.3, w * 0.75)
        bx = ax + L * rng.choice((-1, 1))
        by = ay + rng.uniform(-h * 0.25, h * 0.45)
        amp = rng.uniform(40, 110) * rng.choice((-1, 1))
        out.append(vine((ax, ay), (ax + (bx - ax) * .3, ay + amp),
                        (ax + (bx - ax) * .7, by - amp), (bx, by)))
    cols = int(w / cell) + 2
    rows = int(h / cell) + 2
    for ri in range(rows):
        for ci in range(cols):
            x = x0 + ci * cell + rng.uniform(-cell * .3, cell * .3)
            y = y0 + ri * cell + rng.uniform(-cell * .3, cell * .3)
            d = (y - y0) / max(h, 1)
            if d < fade_from:
                keep = 1.0                     # the crown is solid before it thins
            else:
                keep = max(0.0, 1 - (d - fade_from) / (1 - fade_from)) ** 1.3
            if rng.random() > keep:
                continue
            r = r0 * rng.uniform(0.6, 1.15) * (1 - 0.28 * d)
            out.append(motif(rng, pal, x, y, r, rng.uniform(0, 360)))
    return "".join(out)


def tendril(rng, pal, p0, p1, p2, p3, n=5, r0=26, taper=0.55, keep_out=None, pad=30):
    """One vine that falls out of the crown, carrying fewer and smaller blooms
    the further it gets."""
    out = [vine(p0, p1, p2, p3, w=2.2)]
    for i in range(n):
        f = i / max(n - 1, 1)
        t = 0.12 + 0.84 * f + rng.uniform(-0.05, 0.05)
        (x, y), ang = vine_at(p0, p1, p2, p3, min(max(t, 0.02), 0.99))
        off = rng.uniform(-1, 1) * r0 * 0.7
        x += math.cos(math.radians(ang + 90)) * off
        y += math.sin(math.radians(ang + 90)) * off
        if keep_out and _inside(x, y, keep_out, pad):
            continue
        out.append(motif(rng, pal, x, y, r0 * (1 - taper * f) * rng.uniform(0.85, 1.15), ang))
    return "".join(out)
