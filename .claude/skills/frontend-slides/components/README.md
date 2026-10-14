# Component Library (FSC)

Reusable animated HTML components for brand decks. They read only the brand tokens (`brand/tokens.css`), so each one automatically matches the active theme (Ledger / Editorial / Terminal) and mode (light / dark).

- `library.css`: component styles (one `/* === NAME === */` section per component)
- `library.js`: builds and animates components; exposes `window.FSC`
- `vendor/rough-notation.js`: [Rough Notation](https://roughnotation.com) (MIT) for hand-drawn text effects. Paste it before `library.js` whenever a deck uses `underline`, `circle`, `highlight`, `strike`, `box`, `bracket` or `crossed`; keep its license header.
- `layouts.css`: Swiss pitch-document slide layouts (section header, giant word, ranked bars, big numbers, process steps, statement, panel backgrounds). Signature of the Index theme, usable in every theme. Examples: `brand/themes/index.html`.
- `icons.js`: icon + character drawings (`window.FSC_ICONS`). Paste it **before** `library.js` whenever a deck uses icons, characters, `iconset` or `actors`.
- `gallery.src.html`: bento preview page (source). `gallery.html` is its built, self-contained copy: run `python3 components/build.py` after any library edit, then screenshot-check it.

## How to use in a deck

1. Set the theme on the root: `<html lang="en" data-theme="ledger">` (add `class="dark"` for dark mode). Paste `brand/tokens.css` and the theme's font link into the deck.
2. Paste `library.css` into the deck's `<style>` and `library.js` into a `<script>` **before** the deck controller. To keep files small, you may paste only the sections for components the deck uses (the core block at the top of each file is always required).
3. Place a component as an element with explicit stage-pixel size:
   ```html
   <div data-fsc="tx" style="width:1680px;height:300px" data-steps="Issue:Bank mints tokens|Transfer:On-chain payment|Redeem:Back to deposits"></div>
   ```
4. That's it. Components play automatically when their `.slide` becomes `.visible`, and replay each time the slide is revisited. With `prefers-reduced-motion` they render in their final state.

## Catalog

| `data-fsc` | What it shows | Use for | Configure | Good size (stage px) |
| --- | --- | --- | --- | --- |
| `chain` | Blocks sliding in and linking by hash; last block is accent | "What is a blockchain", immutability, title/section visuals | `data-count`, `data-start`, `data-labels="A|B|C"` | 1200–1680 × 240–320 |
| `tx` | A dot travelling through steps; final step accent | Any linear process: tx lifecycle, settlement, onboarding, methodology | `data-steps="Label:caption|…"` (3–6 steps) | 1400–1680 × 240–300 |
| `gossip` | Message spreading hop by hop through a P2P network | Consensus, propagation, decentralization, network effects | `data-nodes` (≤20), `data-origin`, `data-caption` | 800–1000 × 460–560 |
| `merkle` | Merkle tree building from leaves to an accent root | Data structures, inclusion proofs, light clients, rollups | `data-leaves="Tx1|…"` (4 or 8) | 800–1000 × 440–520 |
| `hash` | Word scrambles through hex, then resolves; optional digest line | Statement slides, key terms, section openers | text via `data-text`, `data-size`, `data-digest="off"` | width of text × 220–320 |
| `term` | Terminal window typing commands with output | Smart-contract demos, CLI tooling, testing steps | child `<p data-cmd>` (typed) and `<p>` (output); `class="hl"` on ONE line; `data-title` | 700–900 × 380–480 |
| `spec` | Items positioned along an axis between two extremes | Positioning, comparisons, taxonomies | `data-left`, `data-right`; child `<i data-pos="0..1">`, `data-hl` on ONE | 1400–1680 × 340–400 |
| `line` | Animated multi-series line chart | Trends over time | JSON child | 800–1100 × 440–560 |
| `bar` | Animated bar chart, one bar highlighted | Comparing chains, protocols, costs | JSON child, `"highlight": "Label"` | 800–1100 × 440–560 |
| `doughnut` | Animated doughnut with legend | Shares of a whole: tokenomics, market share | JSON child, `"highlight"`, `"center"`, `"centerLabel"` | 900 × 500 |
| `candle` | Candlestick chart: hollow = up, filled = down, accent = the candle you discuss; optional volume, moving average, last-price tag, event note | Price action, volatility, event studies, market structure | JSON child (below) | 900–1200 × 480–560 |
| `chainloop` | **Continuous**: new blocks are mined on the right (accent, "mining…" → hash), link to the chain, and the chain glides left forever | Title/section slides about blockchains; `data-mode="bg"` for a faint ambient background band | `data-start`, `data-speed` (s per block, default 1.3; bg 2), `data-block` (block width px), `data-mode="bg"` | full slide width × 200–260 |
| `iconset` | Grid of icons or characters with labels, drawing in one by one | "What we'll cover", life-in-Singapore slides, cast introductions | `data-icons="bank|coin|…"`, `data-cols`, `data-size`, `data-labels="off"` | any; ~120px per icon cell |
| `actors` | Alice & Bob scene: an item travels from left to right, directly or via a middle character | Payments, custody, intermediaries (Trent = bank), cryptography and attacks (Eve, Mallory) | `data-left`, `data-right`, `data-middle="trent|eve|mallory|none"`, `data-item` (any icon), `data-note`, `data-caption`, `data-eve-note` | 1200–1600 × 560–680 |

### Icons and characters (inline)

Drop an icon anywhere, including inside titles or cards: `<i data-icon="hawker" data-size="96px"></i>`. Icons draw themselves in when the slide appears and take the surrounding text color; their one accent detail uses the brand accent.

- **Finance & institutions:** `bank coin wallet card vault key lock shield exchange growth contract qr globe block kyc regulator`
- **Life in Singapore:** `hawker kopi crab durian bus mrt transit hdb hive mbs supertree study laptop rain sun plane` (`hive` is a small icon of The Hive)
- **Characters:** `alice bob eve trent mallory` (Alice and Bob are the default pair; Trent is the trusted third party, so use him for banks and custodians; Eve eavesdrops; Mallory actively attacks). Use them consistently: the same character always plays the same role across a deck.

Add a new icon by adding an entry to `icons.js` (48×48 grid, 2.2px strokes, at most one `class="a"` fill or `class="as"` stroke for the accent), then rebuild and check the gallery.

### Text effects (inline, for titles and statements)

Wrap a word or phrase: `<h2>Settlement becomes <span data-fx="underline">final</span>.</h2>`

| `data-fx` | Effect | Extra attributes |
| --- | --- | --- |
| `underline` | Hand-drawn underline (Rough Notation) | |
| `circle` | Hand-drawn circle around the word | |
| `highlight` | Hand-drawn marker behind the word | |
| `box` | Hand-drawn box around the word | |
| `bracket` | Hand-drawn brackets around a phrase | `data-brackets="left,right"` (also `top`, `bottom`) |
| `crossed` | Hand-drawn cross-out | |
| `strike` | Hand-drawn strike-through, then the replacement appears | `data-to="seconds"` |
| `cycle` | Swaps through words and stops on the last one (accent) | `data-words="faster|cheaper|final"` |
| `words` | Words rise one by one (good for a whole title); Chinese text without spaces rises character by character | |
| `type` | Typewriter with caret | |
| `scramble` | Hex scramble that resolves into the word | |
| `count` | Number counts up | `data-to`, `data-dec`, `data-prefix`, `data-suffix` |

One text effect per slide, and it replaces any other accent on that slide. They work in every theme, light and dark.

### Data format (charts)

Data lives in a JSON block inside the component, so real data can be swapped in without touching layout code:

```html
<div data-fsc="bar" style="width:1000px;height:520px">
  <script type="application/json">
  { "labels": ["Visa", "Ethereum L1", "Solana"], "unit": "", "highlight": "Solana",
    "series": [{ "name": "TPS", "values": [1700, 15, 1050] }] }
  </script>
</div>
```

- `line`: `{ labels, unit, series: [{ name, values, highlight? }] }`; one series should have `"highlight": true`.
- `bar`: `{ labels, unit, highlight, series: [{ name, values }] }`.
- `doughnut`: `{ labels, unit, highlight, center, centerLabel, series: [{ values }] }`.
- `candle`: `{ ohlc: [[open, high, low, close], …], labels?, volume?, ma?: 7, unit: "$", highlight?: index | "last", note?, source? }`. Paste real OHLC data (e.g. exported from an exchange) and always fill `source`.
- From JS (e.g. after fetching a CSV): `FSC.update(el, data)` re-renders and replays.
- If no JSON is given, charts render **illustrative demo data**. Never ship demo numbers in a real deck: use the user's data or clearly label figures as illustrative.

### Backgrounds

`chainloop` accepts `data-mode="bg"`: low opacity, no accent, slower drawing. Position them absolutely inside the slide, behind the content, for example:

```html
<section class="slide">
  <div data-fsc="chainloop" data-mode="bg" style="position:absolute;left:0;top:40px;width:1920px;height:200px"></div>
  <h1 style="position:relative">One year at <span data-fx="underline">NTU</span>.</h1>
</section>
```

Keep backgrounds away from the main text block (or behind empty space) so text contrast stays high. Use at most one background loop per slide.

## Rules for using components in decks

- **Earn the slot.** Use a component only when it explains something better than text: a process, a system, a structure, a comparison, or data. Most decks need 2–5 components, not one per slide.
- **One animated component per slide**, and it counts as that slide's single accent moment (brand rule). Keep other elements on that slide static or minimal.
- Charts must use real or explicitly labelled illustrative data. Put the source in a small mono caption under the chart.
- Respect the fixed stage: give components explicit px sizes that fit with the slide's title and padding, then screenshot-check for overflow and overlap.
- Customize content via attributes and JSON; only edit `library.css/js` to change a component for every future deck (then rebuild and re-check the gallery).

## Adding a new component

1. Add a `/* === NAME === */` CSS section that reads brand tokens only, with `.is-playing` (animating) and `.is-done` (final) states and a reduced-motion fallback.
2. Register it in `library.js` as `R.name = { mount(el), play?(el, later), final?(el) }`.
3. Add a card to `gallery.src.html`, run `build.py`, and screenshot the gallery in all three themes, light and dark.
4. Add a row to the catalog above.

## Images

Decks can include images; treat them as part of the composition, not decoration.

- **User-provided files:** copy them into `<deck-name>-assets/` next to the deck and reference them with relative paths. Follow the Image Pipeline in `html-template.md` (resize anything >1MB).
- **Online images:** only from sources the user points to or that are clearly free to use; save them locally rather than hot-linking, so the deck works offline and in PDF export.
- **Stock photography (Unsplash):** only when the user explicitly asks for stock photos. Download into the assets folder and credit the photographer in a small mono caption.
- **Brand treatment:** full-bleed images get a `--paper`-tinted gradient overlay so text stays readable; inline images sit in the theme's frame (square corners, `--stroke` ink border for Ledger/Terminal; no border, 2px radius for Editorial). Prefer one strong image per slide; never place an image and an animated component on the same slide.
- Do not fabricate screenshots of real products or use institution logos (see BRAND.md).
