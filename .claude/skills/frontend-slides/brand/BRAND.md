# Personal Brand System — MSBT Blockchain Decks

This is the user's own design system. It is the **default look for every deck** this skill generates, unless the user explicitly asks for a different style (a preset, a bold template, or "something new"). In that case, fall back to the normal Phase 2 style discovery.

Context: the user is an MSBT (Master of Science in Blockchain Technology) student at NTU. Most decks are school projects, seminars, and research presentations on blockchain, digital assets, and fintech. The tone is **academic but modern**: credible enough for a lecturer, sharp enough to stand out from default slide templates.

The brand is one shared rulebook plus **three themes**. The themes are deliberately different so the user can choose a voice per deck; the shared rules keep them recognizably "the same person's work".

---

## 1. Shared Rules (apply to every theme — MANDATORY)

### Accent color: sparingly
- **One accent moment per slide.** Examples: the final period of a headline, one highlighted word, the one active block in a chain, one key number, the single "winner" column in a table.
- Never use the accent for body text, full backgrounds, or more than one card per slide.
- Charts: draw everything in ink/muted tones; use the accent only for the series or bar the slide is about.

### Motion: subtle
- Default entrance: fade + 24–36px rise, `cubic-bezier(0.16, 1, 0.3, 1)`, 0.8–0.9s, staggered by ~0.12–0.15s.
- At most **one signature effect per deck** (e.g. the chain blocks linking, a node diagram drawing in). No count-ups on every slide, no bouncing.
- **Continuous motion** is limited to: the Terminal status dot, the `chainloop` component, and `oculus` with `data-spin="on"` (user-approved ambient loops). Use `chainloop` on title/section slides or as a faint `data-mode="bg"` band, at most one per slide; it pauses automatically when its slide is not visible.
- Always keep `prefers-reduced-motion` support.

### Slide chrome
- **Title slide:** may show course line (`MSBT · <course or seminar name>`), group/presenter, and date. Use placeholders like `Your Name` / `Group 00` if the user did not supply them — never guess a name.
- **All other slides:** a small header showing **the deck title only**. No slide numbers, no presenter name, no course name inside the slide. (A page counter in the deck controls outside the stage is fine.)
- Header typography: the theme's mono font, ~20px, uppercase, letter-spacing 0.12–0.18em, muted color.

### Light and dark
- Every theme defines both variants via CSS variables. Light is `:root`, dark is `:root.dark`.
- Default: **light** for reading-first / handout decks, **dark** for speaker-led decks shown on a screen. If the user states a preference, follow it.
- Include a `D` key toggle so the user can flip modes while presenting. Ship both variants in the same file.

### Content voice
- Blockchain-native visual metaphors are welcome but must stay restrained: chained blocks, hash snippets (`0x9f…a31c`), node/network diagrams, block grids. Max one such device per slide.
- No crypto clichés: no glowing coins, no neon "to the moon" gradients, no stock-photo bitcoins, no purple-on-white gradients.
- Never fabricate citations or data. If a statistic is illustrative, mark it as such or ask the user for the real figure.

### Fixed stage
All existing frontend-slides rules still apply: 1920×1080 stage scaled as a whole, full `viewport-base.css`, no overflow, no overlapping panels, and verify with screenshots. Brand rules add identity; they never override the fitting rules.

---

## 2. Choosing a Theme

| Theme | Voice | Pick when |
| --- | --- | --- |
| **Ledger** | Technical, precise, research-report | Technical deep-dives, protocol/architecture explainers, data-heavy or reading-first decks. **Default if nothing else fits.** |
| **Editorial** | Academic, warm, considered | Policy, regulation, economics, literature reviews, case studies, essays-as-slides. |
| **Terminal** | Bold, crypto-native, energetic | Pitches, hackathons, product demos, debates, anything that should feel punchy. |

Selection flow:
1. If the user names a theme → use it.
2. Otherwise infer from the topic and purpose using the table above, **tell the user which theme you chose and why in one line**, and proceed. Do not run the 3-preview style discovery for brand decks.
3. If the user says "show me options" → render the title slide in all three themes (light + dark) and let them pick.

All theme colors and fonts are also available as ready-to-use CSS variables in `brand/tokens.css` (`<html data-theme="ledger|editorial|terminal">`, plus `class="dark"`). Use it for every brand deck so the component library matches.

Reference implementations of each theme's title slide live in `brand/themes/` (`ledger.html`, `editorial.html`, `terminal.html`). Read the chosen theme's file before generating; reuse its tokens, fonts and components. Do not copy its demo text.

---

## 3. Theme: Ledger

**Personality:** Swiss-grid precision meets a block explorer. Heavy grotesk headlines, generous whitespace, one electric-blue signal.

**Fonts** (Google Fonts): `family=Archivo:wght@400;600;800;900&family=JetBrains+Mono:wght@400;500`
- Display: Archivo 900, letter-spacing −0.035em, line-height 0.9. Title slide 180–210px; section/content titles 96–120px.
- Body: Archivo 400, 30–36px, muted color.
- Mono (labels, header, hashes, captions): JetBrains Mono 500, 18–24px.

**Tokens**
| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#f3f2ee` | `#0b0c10` |
| `--ink` | `#121316` | `#eceef3` |
| `--muted` | `#6b6d73` | `#8a8f9c` |
| `--rule` | `rgba(18,19,22,.14)` | `rgba(236,238,243,.14)` |
| `--accent` | `#2445ff` | `#5a72ff` |
| `--accent-ink` (text on accent) | `#ffffff` | `#0b0c10` |

**Signature elements**
- Background: 120px square grid drawn with `--rule` lines.
- Headline ends with an accent-colored period: `Tokenized deposits<span class="accent">.</span>`
- Eyebrow label in mono, accent color, prefixed with `// `.
- Chained blocks: 170×96px boxes, 2px ink border, square corners, joined by 56px ink lines; only the final/active block is filled with accent.
- Cards: square corners (border-radius 0), 2px ink border or `--rule` hairline, no shadows.
- Tables: hairline rows, mono uppercase headers.

---

## 4. Theme: Editorial

**Personality:** an economics journal with a soft glow. Serif headlines with italic amber phrases, deep green ink, airy layouts.

**Fonts** (Google Fonts): `family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400`
- Display: Fraunces 600, `font-variation-settings:'opsz' 144`, letter-spacing −0.02em, line-height 0.98. Title 110–130px; content titles 80–100px.
- Accent phrase inside headlines: Fraunces 400 *italic* in accent color (this counts as the slide's accent moment).
- Body: Instrument Sans 400, 30–34px, muted.
- Mono labels: IBM Plex Mono 400, 20–22px, uppercase, letter-spacing 0.12em.

**Tokens**
| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#f2ece0` | `#0f2621` |
| `--ink` | `#13302a` | `#f1e9da` |
| `--muted` | `#5d6b63` | `#9fb1a7` |
| `--rule` | `rgba(19,48,42,.18)` | `rgba(241,233,218,.16)` |
| `--accent` | `#d9931c` | `#f0ad3a` |
| `--panel` | `#e8dfcd` | `#163530` |

**Signature elements**
- Background: soft radial accent glow (~14% accent) at the right side over `--paper`.
- Header: thin `--rule` underline beneath the header row; course name set in italic serif on the title slide.
- Network diagrams: circular nodes (2px ink outline, paper fill) joined by dashed ink lines (`stroke-dasharray: 6 8`); one node filled with accent.
- Cards: `--panel` fill, 2px radius at most, no borders or a single `--rule` hairline.
- Pull quotes: large Fraunces italic, with a thin accent rule on the left.

---

## 5. Theme: Terminal

**Personality:** a block explorer turned poster. Wide uppercase display type, mono everything else, a single lime highlighter.

**Fonts** (Google Fonts): `family=Unbounded:wght@500;700;800&family=IBM+Plex+Mono:wght@400;500;600`
- Display: Unbounded 800, uppercase, letter-spacing −0.03em, line-height 1.02. Title ~120px; content titles 72–90px. Unbounded is very wide: keep titles to 2–3 short words per line and check for overflow.
- Body and labels: IBM Plex Mono 400/500, body 28–30px, line-height 1.5.

**Tokens**
| Token | Light | Dark |
| --- | --- | --- |
| `--paper` | `#e9ebe4` | `#0c0d0b` |
| `--ink` | `#0e0f0c` | `#eef1e6` |
| `--muted` | `#5e6158` | `#878b7e` |
| `--rule` | `rgba(14,15,12,.16)` | `rgba(238,241,230,.14)` |
| `--accent` | `#b6e400` | `#c8ff1a` |
| `--cell` | `#d7dacf` | `#1a1c17` |
| `--on-accent` (text on accent) | `#0e0f0c` | `#0c0d0b` |

**Signature elements**
- Top status bar: full-width, 84px, 2px ink bottom border; small square status dot in accent (the one allowed continuous blink).
- Command-style eyebrow: `> query --topic <slug>` in mono, muted with the verb in ink.
- Highlighter: one headline word wrapped in `<mark>` with accent background and `--on-accent` text.
- Block grid: 6-column grid of 82px square cells in `--cell`, a few filled with ink, a few with accent.
- Footer: 2px ink top border with three mono fields (presenter · date · hash) on the title slide; on content slides use only the header chrome.
- Cards: square corners, 2px ink border; the highlighted card gets an accent top bar, not an accent fill.

---

## 6. Logo and icons

- The user has no logo. Do not invent one, and do not use the NTU crest or any institution's logo. Course names may appear as text only.
- Icons: simple line icons drawn as inline SVG, 2px stroke in `--ink`, square or round caps to match the theme (Ledger/Terminal square, Editorial round). No emoji as icons, no icon fonts.
