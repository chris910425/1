# Bitgrid: PowerPoint template (繁體中文)

Raw Grid's framework + Retro Windows' windows and terminals + 8-bit Orbit's pixel titles, built for
blockchain coursework. Sample deck: `bitgrid-sample.pptx` (10 slides, fully editable).

## The system

| | |
|---|---|
| Framework | 3px black lines divide the page into cells that touch edge to edge; header bar (pixel title + `BLOCK #n` tag), footer bar (deck name + page) |
| Depth | Hard offset shadows only (solid black or cyan rectangles, no blur) |
| Windows | 3px frame, navy title bar `■ NAME.EXE` with three boxes; content: terminal screen, lists, dialogs |
| Data | Segmented 8-bit progress bars, big pixel numbers, native PowerPoint doughnut chart with a grid legend |
| Arrows | Pixel arrows built from squares; `→` in text |
| Idea | The deck is a chain: every slide's tag is a block height (`BLOCK #1024`, `#1025` …), the cover "loads" a block, the closing slide "saves" one |

**Colours:** ink `#0A0A0A`, paper `#FFFFFF`, cell grey `#F2F2EF`, night `#0B0E2E` (cover, closing),
window bar `#1B1FA8`, cyan `#6FE0EE`, yellow `#FFD84A`, pink `#FF9EC7`, terminal screen `#0D1117`
with text `#A6F4C0`. One highlight fill per slide (cyan, yellow or pink); yellow is also the title shadow.

**Type:**
- Titles: **Cubic 11 / 俐方體11號** (pixel, 繁體 + Latin, SIL OFL), sizes in multiples of 12
  (48, 60, 72, 96, 120…), thickened with a half-pixel outline and a half-pixel yellow step shadow.
- Body: Segoe UI + Microsoft JhengHei (on every Windows PC).
- Terminal and labels: Consolas + Microsoft JhengHei.

## Fonts on your PC (once)

1. Double-click `fonts/Cubic_11.ttf` → **Install**.
2. When you send the deck to someone else: PowerPoint → File → Options → Save → tick
   **Embed fonts in the file** → **Embed all characters**. Then their PC shows the pixel titles too.
   Without the font, titles fall back to Microsoft JhengHei (still readable, not pixel).

## Slide types in the sample

1 cover (night, pixel title, miner window, loading bar, info strip) · 2 contents (cyan side + arrow rows)
· 3 chapter divider (yellow, giant pixel number, chapter progress) · 4 explanation + terminal window
· 5 four-step process with arrows and status bar · 6 doughnut chart + legend grid + takeaway
· 7 four big numbers with bars · 8 two windows compared · 9 block-chain timeline · 10 closing dialog.

## Building a deck with it

Brainstorm and write the story first (presentation-writing, academic-pptx), then build with
`ppt-master` (Quick or Default route) using the tokens above. `author.py` holds the drawing helpers
(header, footer, window, segmented bar, pixel arrow, pixel title) to copy from. Export with
`--native-charts-and-tables` so charts stay editable. Review with `slide-taste`.

Note: `.claude/skills/ppt-master/scripts/svg_to_pptx/drawingml/utils.py` has a one-line local patch
adding `Cubic 11` to `EA_FONTS`, so Chinese title text uses the pixel font in PowerPoint.
