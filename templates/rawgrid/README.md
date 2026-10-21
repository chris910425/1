# Raw Grid: PowerPoint template + component kit (繁體中文)

The Raw Grid look (black 3px lines that ARE the layout, cells that meet without gaps, hard black
offset shadows, two pastel fills, heavy uppercase type, arrows and bordered bars), rebuilt for
PowerPoint, with the Slide Studio library elements redrawn in the same language.

| File | What |
|---|---|
| `rawgrid-sample.pptx` | 14-slide sample deck: cover, statement, chapter, chain, Merkle proof, 3-step network propagation (Morph), process, doughnut, text effects, terminal, icons, closing |
| `rawgrid-kit.pptx` | Component sheet: every element in full and faint strength, all 49 icons, 5 characters. Copy-paste into any deck |
| `kit/rawgrid.py` | The kit: functions that print PPT Master-ready SVG for each element |
| `kit/export_icons.js` | Re-exports the library icons into PPT Master (`fsc-line`, `fsc-char`) |
| `build_sample.py`, `build_kit.py` | How the two decks are made (copy patterns from here) |
| `fonts/` | Noto Sans TC Black (SIL OFL) |
| `font-options/` | The three 繁體 heavy fonts compared (A chosen) |

## Fonts

| Role | Font | Notes |
|---|---|---|
| Titles, big numbers | **Segoe UI Black** (Latin) + **Noto Sans TC Black** (中文) | Raw Grid's display face is Segoe UI at weight 900; Noto Sans TC Black is the closest heavy 黑體. Never add bold on top. |
| Body | Segoe UI + Microsoft JhengHei | Both on every Windows PC |
| Hashes, terminal | Consolas + Microsoft JhengHei | |

On your PC once: double-click `fonts/NotoSansTC_900Black.ttf` → **Install**. When sharing a deck:
PowerPoint → File → Options → Save → **Embed fonts in the file** → **Embed all characters**.
Without the font, titles fall back to Microsoft JhengHei (fine, just lighter).
Alternatives: Chiron Hei HK Black (B), or Microsoft JhengHei Bold with nothing to install (C):
change `TITLE` in `kit/rawgrid.py` and the brand spec.

## Colours

ink `#0A0A0A` · paper `#FFFFFF` · pink `#F2D4CF` · green `#E5EDD6` · grey cell `#F5F5F5` ·
dark text `#333333` · muted `#6B6B6B` · faint lines `#D6D6D2` (on pink `#E2B8B0`, on green `#C9D6B4`).
One pastel marks "the important one" per slide; shadows are solid black 6px (small 4px), never blurred.

## Components (`kit/rawgrid.py`)

| Element | Call | Strengths / notes |
|---|---|---|
| Page, lines, cells | `page(role, body)`, `hline`, `vline`, `cell`, `card` | Lines are 3px; cards have the hard shadow |
| Header | `header(title, n, total, right=None)` | Title + **block-progress chain** (one block per slide) + rule |
| Type | `title`, `text`, `para`, `label`, `arrow_item`, `big_number`, `ghost_number` | Latin uppercased automatically; Chinese never tracked |
| Bars | `bar(x, y, w, frac, fill, value)` | Bordered track, pastel fill |
| Chain of blocks | `chain(x, y, n, start, bw, bh, gap, faint=False)` | full: #height strip, PREV/HASH rows, newest pink · faint: texture |
| Progress chain | `progress_chain(x, y, n, total)` | Used in every header |
| Merkle tree | `merkle(x, y, w, h, leaves, proof=None, faint=False)` | `proof=i` fills the authentication path green, root pink |
| Network propagation | `network(x, y, w, h, n, wave=None, faint=False)` | `wave=0,1,2…` on consecutive slides + Morph = the message spreading |
| Process / tx steps | `tx_steps(x, y, w, h, steps, current)` | Raw Grid columns, ghost numbers, done green / current pink |
| Doughnut | `doughnut(key, cx, cy, data)` + `legend_rows(...)` | Real PowerPoint chart (export with `--native-charts-and-tables`) |
| Terminal | `terminal(x, y, w, h, lines)` | `("$", cmd)`, `("", output)`, `("!", highlighted)` |
| Text effects | `fx_highlight`, `fx_underline`, `fx_circle`, `fx_box`, `fx_strike`, `fx_bracket`, `fx_hash`, `fx_type` | Static end states of the library's animated effects; hand-drawn strokes |
| Icons | `icon(name, x, y, size, color)` / `icon(name, …, lib="fsc-char")` | 49 line icons `fsc-line/*` + Alice, Bob, Eve, Trent, Mallory `fsc-char/*` |

**Faint vs full.** Faint versions are background texture (cover panel network, chapter-page Merkle
tree); keep text off their busiest part. Full versions are diagrams that explain something and
should carry the slide.

## Using it with PPT Master

PPT Master knows the identity as the brand **`raw-grid`**
(`.claude/skills/ppt-master/templates/brands/raw-grid/`, registered in `brands_index.json`).

1. Story first (presentation-writing, academic-pptx), then PPT Master: Default route → choose
   template mode with brand `raw-grid` (or Quick with that workspace root).
2. Author pages with `kit/rawgrid.py` (import it in a small build script like `build_sample.py`,
   or paste its output). Sync icons: `icon_sync.py <project> fsc-line/<name> … fsc-char/<name>`.
3. `stamp_native_fallbacks.py <project>/svg_output --write` (doughnuts), then the final checker and
   `svg_to_pptx.py <project> --quick-generate --native-charts-and-tables -t morph`.
4. Review with `slide-taste` (`render.sh`).

Local PPT Master patches (re-apply after updating PPT Master):
`scripts/svg_to_pptx/drawingml/utils.py` adds Noto Sans TC (Black), Chiron Hei HK (Black) and Cubic 11
to `EA_FONTS`; `scripts/icon_sync.py` allows the `fsc-line` and `fsc-char` libraries.
