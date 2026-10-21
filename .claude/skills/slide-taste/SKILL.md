---
name: slide-taste
description: Art direction and quality review for presentation slides, HTML or PowerPoint. Use whenever you build, draft, redesign, polish, critique or review a deck, slide, pitch, class presentation or .pptx (with frontend-slides, ppt-master or any other builder), when the user says slides look generic, cluttered, boring, "AI-made" or asks to make them look designed, and when the user shares a screenshot of a website, template or artwork and wants its look turned into a theme or template. Adapts Taste Skill and Impeccable (web skills) to slides; the user's brand always wins.
---

# Slide taste

Turns two website design skills into rules for slides:
`design-taste-frontend` (Taste Skill: art direction, a study of 247 award sites, a juror's critique) and
`impeccable` (design-review vocabulary: hierarchy, typeset, layout, colorize, distill, quieter, bolder).
Their web-only parts (scrolling, navigation, buttons, responsive widths, 16px body text, 120px section
gaps) are left out; what carries over is restated here for a 16:9 canvas seen from across a room.

This skill does not build slides. The builder does (`frontend-slides` for HTML, `ppt-master` for
PowerPoint). This skill decides how the deck should look before building, and checks the result after.

## 0. Precedence

1. The user's words. 2. The user's brand (`frontend-slides/brand/BRAND.md`, `tokens.css`, the chosen
theme) and template recreations they asked for. 3. This skill. 4. Taste Skill / Impeccable originals.

The brand deliberately uses things Taste Skill bans as house style. They are **allowed** here when the
theme uses them: small tracked uppercase labels (kickers), monospace labels (Terminal), numbered
section markers and numbered circles (Index, Heritage, Slate), glass panels and photo treatments
(`layouts.css`), hand-drawn highlights (Rough Notation), botanicals, icons, thin rules in Editorial and
Heritage. Allowed means "use with a job", not "use everywhere": the tells list in
`references/tells.md` still applies to how often and where.

## 1. The order of work

Every deck, every time:

1. **Story before pixels.** The argument comes from `presentation-writing` (and `academic-pptx` for
   coursework): one claim per slide, written as a sentence. A slide without a claim is cut or merged.
2. **The idea.** One sentence: "In this deck, <the subject's own material> becomes <the visual device>."
   (Blockchain lecture: "blocks become the page grid"; Singapore life: "the MRT map becomes the
   agenda".) Take it from the subject, never from the category. Record it in the deck's `notes.md`.
3. **The look.** Pick the brand theme that fits; or, if the user wants something new, extract one from
   their reference (`references/style-extract.md`), or deal fresh directions from Taste Skill's library
   (`node .claude/skills/design-taste-frontend/scripts/draw.mjs --sector <closest> --keep palette,type`
   to borrow composition only; read its sheet, take what fits slides, ignore web blueprints).
4. **Build** with the builder, applying the laws in §2 while composing each slide.
5. **Look and fix** (§3). Never hand over a deck nobody has looked at as pictures.

## 2. The laws (slides)

### One slide, one thing
- One claim and one dominant element per slide. Squint test: the slide reduces to 2–3 masses with a
  clear biggest one. If two things fight, split the slide.
- Presentation slides (spoken): ≤ 40 words of body text, ≤ 6 lines. Reading decks (sent, not
  presented): may be denser, but still one claim per slide.
- Titles: an assertion ("Gas fees fell 80% after the upgrade"), or a short label of ≤ 6 words for
  section and cover slides. Never generic ("Introduction", "Overview", "Conclusion").

### Type
- At most **3 sizes on a slide, 5 in the deck**, far apart. Display ÷ body ≥ 3 (≥ 4 on covers).
- Minimum sizes (projected at the back of a classroom):

  | Canvas | Display | Title | Lead | Body | Smallest (captions, footers, sources) |
  |---|---|---|---|---|---|
  | HTML stage 1920×1080 | 120–240 | 60–96 | 36–44 | 28–34 | 22 |
  | PPT Master SVG 1280×720 | 80–160 | 40–64 | 24–30 | 19–23 | 15 |
  | PowerPoint points | 60–120 pt | 30–48 pt | 18–22 pt | 14–18 pt | 11 pt |

- Display type: tight leading (0.95–1.1) and slightly negative tracking for Latin; **never negative
  tracking or uppercase styling for 繁體中文**; CJK body leading 1.5–1.7, size about 10% larger than
  Latin body, full-width punctuation, no single-character last line.
- Left-aligned by default; centre one moment per deck section at most (cover, statement, closing).
- Big type does not need to be bold. Scale and space make confidence.

### Space and grid
- Margins 6–8% of the slide width on every slide; content never closer to the edge, except
  full-bleed pictures and colour fields.
- 2–3 left edges per slide, the **same edges across the deck**. Content slides keep the title in the
  same place; cover, section and statement slides may break it.
- Related things close, unrelated far. A hole (empty by accident) is a defect; a rest (empty by
  decision) is allowed once per slide.

### Colour
- Ground 60–80%, ink and support 20–30%, **accent ≤ 10% of a slide, on one thing** (the number, the
  word, the highlighted bar). If the accent is in five places it means nothing.
- Same theme on every slide; a dark slide inside a light deck is a deliberate section or statement
  move (`tone-dark`), not variety for its own sake.
- Text contrast ≥ 4.5:1 against what is actually behind it (check text on photos and fields).

### Pictures
- One large picture beats several small ones. Full-bleed or a clear share (≥ 40% of the slide).
- One grade across the deck (same treatment: all duotone, all mono, all warm…). Same crop ratios.
- Text on a picture sits on a scrim or the picture's own dark area, never on busy detail.
- No clip-art, no generic stock handshakes and lightbulbs, no AI images with garbled text.

### Data
- One message per chart, stated in the title. Highlight the series that matters in the accent; the
  rest in muted ink. Label directly; drop legends, gridlines and 3D.
- Big numbers: the number at display size, one line of context, the source in the smallest size.

### Deck rhythm
- Name each slide's layout in one word (cover, statement, split, list, chart, full-bleed, quote,
  grid…). **No three in a row with the same word.** A dense slide is followed by a breathing one.
- Long decks: a section divider every 4–7 content slides; dividers share one design.
- At most one loud motion style per deck (`components/motion.*`), on a cover, divider or closing.

## 3. Look and fix

1. **Render** every slide to images:
   `bash .claude/skills/slide-taste/scripts/render.sh <deck.pptx | deck.pdf | deck.html | svg_output/> [out_dir]`
   It writes `slide-NN.png` per slide and `sheet.png` (contact sheet of the whole deck).
2. **Critique the pictures, not the code** with `references/critique.md`: the passes, the score, the
   caps, and the written ROUND block. Check `references/tells.md`.
3. **Fix the top three problems**, in the order idea → hierarchy → composition → type → pictures →
   colour → detail. Re-render, re-critique.
4. **Stop** after three rounds, or earlier when a round finds nothing a classmate would notice. If the
   deck still scores under 7.5, say so and list what remains; do not round up.

Tell the user in one or two plain sentences what the review changed; the ROUND blocks go in the deck's
`notes.md`, not in the chat.

## 4. Reviewing a deck the user brings

Render it (§3.1), write one ROUND block, and report the top three problems in plain language with the
slide numbers, plus what you would change. Change nothing until the user agrees, unless they asked
for fixes.

## 5. Turning a reference into a theme

When the user shares a website, template, poster or artwork they like: follow
`references/style-extract.md` (measure the palette with `scripts/palette.py`, match fonts, describe the
layout grid and signature details, save to `inspiration/`, then build it as a brand theme in
`tokens.css` + `BRAND.md` and, for PowerPoint, as a PPT Master style).

## Files

| File | What |
|---|---|
| `references/critique.md` | The slide juror: passes, score, caps, ROUND template |
| `references/tells.md` | What makes slides look generated or templated, and what to do instead |
| `references/style-extract.md` | Screenshot or template → palette, type, grid, motifs → theme |
| `scripts/render.sh` | Deck (pptx / pdf / html / svg folder) → slide PNGs + contact sheet |
| `scripts/palette.py` | Measured palette with roles from a screenshot |
