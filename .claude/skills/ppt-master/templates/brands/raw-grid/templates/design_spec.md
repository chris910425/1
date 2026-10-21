---
brand_id: raw-grid
kind: brand
summary: Raw Grid — neobrutalist grid identity for 繁體中文 blockchain coursework; black 3px lines as layout, two pastel fills, heavy uppercase type
primary_color: "#0A0A0A"
---

# Raw Grid Brand Specification

> Identity-only preset (Slide Studio). Pages are composed freely under these constraints. Component kit
> (chain of blocks, Merkle tree, network propagation, transaction steps, doughnut chart, terminal,
> text effects, icon helpers): repository `templates/rawgrid/kit/rawgrid.py`, documented in
> `templates/rawgrid/README.md`; sample deck `templates/rawgrid/rawgrid-sample.pptx`.

## I. Brand Overview

| Property | Value |
|---|---|
| Brand Name | Raw Grid (Slide Studio) |
| Use Cases | MSBT blockchain coursework, seminar talks, project updates, explainer decks in 繁體中文 |
| Tone | Sharp, structural, confident, digital; warmed by two pastel fills |
| Sources | Recreated from the "Raw Grid" design system in beautiful-html-templates (MIT) bundled with frontend-slides, 2026-10-22; adapted for PowerPoint and 繁體中文 |

## II. Color Scheme

| Role | HEX | Provenance | Notes |
|---|---|---|---|
| primary | `#0A0A0A` | fact | Ink: all text, the 3px grid lines, hard offset shadows, black label boxes |
| bg | `#FFFFFF` | fact | Page canvas |
| accent-pink | `#F2D4CF` | fact | Blush pink fill: covers, the newest block, the current step, one highlighted cell per slide |
| accent-green | `#E5EDD6` | fact | Sage green fill: chapter pages, completed steps, Merkle proof siblings, reached nodes |
| surface | `#F5F5F5` | fact | Light grey cell |
| neutral-dark | `#333333` | fact | Secondary text |
| muted-text | `#6B6B6B` | approx | Captions, hash values, tags |
| faint-line | `#D6D6D2` | approx | Background-texture strength of diagrams on white (pink panel: `#E2B8B0`, green: `#C9D6B4`) |

Rules: depth comes only from hard offset shadows in solid black (6px, small 4px), never blurred or coloured. Cells meet without gaps; lines are 3px black. Use at most one pastel fill to mark "the important one" per slide besides full pastel panels.

## III. Typography

| Role | Family | Weight |
|---|---|---|
| title | `Segoe UI Black, Noto Sans TC Black` | 400 (the families are already Black; never add bold) |
| body | `Segoe UI, Microsoft JhengHei` | 400 / 700 |
| mono | `Consolas, Microsoft JhengHei` | 400 |

> Latin is set in uppercase with slight negative tracking for display, +0.08em tracking for small labels; Chinese is never tracked or uppercased. `Noto Sans TC Black` must be installed on the presenting PC (file in `templates/rawgrid/fonts/`), and fonts embedded when the deck is shared; without it titles fall back to Microsoft JhengHei. Sizes on the 1280×720 canvas: display 60–110, slide title 30, body 20–24, labels 14 (bold, uppercase).

## IV. Logo

No logo. The deck name and presenter appear as text on the cover; the header carries the slide title and a block-progress chain (one small block per slide, current block black).

## V. Voice & Tone

- Formality: professional-neutral, direct
- Person: 我 / 我們 / 你 (繁體中文, Taiwan usage unless the user says otherwise)
- Emoji: avoid
- Abbreviations: spell-out-first-use (e.g. 默克爾樹 Merkle tree)

## VI. Icon Style

- Preference: stroke

> Use the Slide Studio library icons `fsc-line/<name>` (finance, law and Singapore-life line icons; 48 grid, recolourable) and the characters `fsc-char/alice|bob|eve|trent|mallory` (keep their colours). Sync with `icon_sync.py <project> fsc-line/<name> …`. Icons sit in bordered grid cells, 64–120px, ink colour; never inside rounded squares.
