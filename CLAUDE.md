# Slide Studio: how to work in this repo

This repo is the user's personal slide-making workspace. The user is an MSBT (blockchain) student at NTU, Singapore, and is not familiar with GitHub or code: handle all git/GitHub work for them and explain things in plain language.

## What's here

- `.claude/skills/frontend-slides/`: the slide-making skill, customized:
  - `brand/BRAND.md` + `brand/tokens.css`: the user's design system (themes **Ledger**, **Editorial**, **Terminal**, **Index**, **Slate**, **Heritage**, each light + dark). Every deck uses it by default.
  - `components/`: the reusable animated component library (see `components/README.md`). Preview page: `components/gallery.html` (rebuild with `python3 .claude/skills/frontend-slides/components/build.py`).
- `.claude/skills/design-taste-frontend/`: the community "Taste Skill" v2 (MIT, from github.com/Leonxlnx/taste-skill @ f624f37), an anti-generic art-direction skill for web pages. Use it as a **design advisor** (its laws of type, space, colour and imagery, its direction/palette library, and its critique rubric in `references/critique.md`), not as the deck builder. Where its house rules ban things the user's brand deliberately uses (tracked uppercase labels, glass, monospace labels, hand-drawn highlights, botanicals, icons), **the user's brand and choices win**.
- `decks/`: one folder per deck: `decks/<deck-name>/`.
- `assets/photos/`: photos the user shared (NTU buildings); see its README.
- `inspiration/`: templates and styles the user liked. When the user shares an image or link they like, save the image file (or the link) here and add a row to `inspiration/README.md` describing what they liked. Check this folder when choosing a look for a new deck.

## The user's workflow (follow it)

The user works conversationally: they share thoughts, you suggest ideas, you go back and forth, make test drafts, and only then build the final deck.

1. **Brainstorm first.** When a new deck starts, do not generate slides until the user says so. Ask about purpose, audience, language and length, then suggest structure and ideas.
2. **Keep a notes file from the first message:** `decks/<deck-name>/notes.md`. Record the goal, audience, language, chosen theme, the outline, ideas (accepted and rejected), and open questions. Update it after every meaningful exchange so nothing is lost if the conversation is long or a new session continues the deck. At the start of any session on an existing deck, read its `notes.md` first.
3. **Test drafts on request:** build only the slides asked for, as `decks/<deck-name>/draft-N.html`, screenshot-check them, and share a preview (see below).
4. **Final deck:** `decks/<deck-name>/index.html`, built with the frontend-slides skill, the brand system and the component library. Use components only where they help.
5. **Save often:** commit and push at each checkpoint (notes updated, draft made, final made) with clear messages, so the user never loses work.

## Previews

The user views work on a phone and on the Claude desktop app on a PC. Always share drafts and decks in a way that opens on both: publish them as a private Artifact link (and update the same link for new versions), in addition to sending the file.

## Public sharing (GitHub Pages)

Pushing to `main` publishes every deck to GitHub Pages via `.github/workflows/pages.yml` (built by `tools/build_site.py`). Links look like `https://chris910425.github.io/<repo-name>/decks/<deck-name>/`; the home page lists all decks and the studio previews. Anything published is **public**: notes.md, drafts, `inspiration/` and `assets/` are excluded on purpose. Keep a deck's images inside its own folder, and only use photos the user has the right to share publicly. When a deck is merged to `main`, give the user its Pages link alongside the private Artifact link.

## Language

Decks may be in Traditional Chinese (繁體中文). Copy the user's wording exactly; never convert to Simplified. Add a matching Traditional Chinese web font (e.g. Noto Sans TC / Noto Serif TC), relax tight letter-spacing and uppercase styles for Chinese text, and use full-width punctuation. Ask whether terminology should follow Taiwan or Hong Kong usage.

## Changing the system

If the user wants a new component, icon, effect or brand tweak, add it to the library or brand files (not just the one deck), rebuild the gallery, check it in all three themes, and say it is now available for future decks.

## Git

- Work on a branch per deck (e.g. `deck/<deck-name>`), or on the branch the session provides. When the user is happy with a deck, merge it into `main` for them.
- Changes to the skill, brand or library must end up in `main` so future decks get them.

## Skills added from the community

- `.claude/skills/ppt-master/` (MIT, github.com/hugohe3/ppt-master @ 8070d3d): builds **editable PowerPoint (.pptx)**. Python deps live in a venv, not the repo: `python3 -m venv /tmp/pptvenv && /tmp/pptvenv/bin/pip install -r .claude/skills/ppt-master/requirements.txt`, then run the skill's scripts with that python. Apply the user's brand (`brand/BRAND.md` colours, fonts) to its output. For 繁體中文 decks pick a font the audience's PC has (Microsoft JhengHei / Noto TC) or embed it.
- `.claude/skills/impeccable/` (Apache-2.0, github.com/pbakaus/impeccable @ 6af45ac, v4.6.0): design critique/polish commands for **web UI**. For slides use it only as a critique vocabulary (hierarchy, typography, colour, layout), not as a builder.
- Motion styles in PowerPoint decks: record them with `tools/record-motion/` (looping MP4, autoplay + loop slide). Clips go in `clips/` or the deck's folder.
- `.claude/skills/playwright-cli/` (Microsoft, Apache-2.0): lets Claude drive a browser (open, click, type, snapshot, screenshot). If the command is missing in a new session: `npm install -g @playwright/cli@latest`. `.playwright/cli.config.json` points it at the preinstalled Chromium. It blocks `file://`, so serve the repo first: `python3 -m http.server 8765 --bind 127.0.0.1` and open `http://127.0.0.1:8765/...`. Working files land in `.playwright-cli/` (gitignored).
- `.claude/skills/find-skills/` (vercel-labs/skills, tracked in `skills-lock.json`): finding and installing community skills with `npx skills`. In this cloud workspace `npx skills find` returns nothing because skills.sh is blocked by the network policy; search the web instead, then install straight from GitHub (`npx skills add https://github.com/<owner>/<repo> --skill <name> --agent claude-code -y`, which works). Always read a new skill and check its license before keeping it.
- Skill-building helpers (for turning web skills into slide skills): `.claude/skills/skill-creator/` (Anthropic, Apache-2.0: drafting a skill, test prompts, evals, trigger-description tuning) and `.claude/skills/writing-skills/` (obra/superpowers, MIT: write a skill test-first: watch an agent fail without it, then write the skill until it passes). `writing-skills` refers to `superpowers:test-driven-development`; that is the local `.claude/skills/test-driven-development/`, installed only as its background. Do not apply TDD to slide or library work unless the user asks.
- Presentation helpers (installed 2026-10, from the Oct 2026 "Awesome Codex PPT Skills" test):
  - `.claude/skills/presentation-writing/` (marcusnelson/presentation-writing-claude-skill, no license file: personal use only, do not redistribute): story first. Use it in the brainstorm phase to turn the user's notes into a slide-by-slide argument (one claim per slide, transitions, closing ask). It never makes the design.
  - `.claude/skills/academic-pptx/` (Gabberflast/academic-pptx-skill, MIT): rules for school/academic talks (action titles, argument structure, evidence, citations). Apply to MSBT coursework decks on top of whichever builder is used.
  - `.claude/skills/frontend-slides-editable/` (archlizheng, MIT; docs folder left out): adds an in-browser edit mode (edit text, move/resize objects, reorder slides, save) to an HTML deck. Build with `frontend-slides` + the brand as usual; use this only when the user wants to edit an HTML deck themselves.
  - Dropped: guizang-ppt-skill (another HTML deck builder, overlaps `frontend-slides`; AGPL). Its presenter view is a feature idea we could rebuild ourselves.
- `.claude/skills/slide-taste/` (ours): Taste Skill + Impeccable transformed for slides. Laws for 16:9 slides (sizes for projection, 3 sizes per slide, accent ≤ 10%, layout rhythm, CJK rules), the slide critique (passes, score, caps, ROUND block saved in the deck's notes.md), slide tells, and style extraction (screenshot → palette/type/grid → theme). Scripts: `scripts/render.sh` (pptx/pdf/html/svg → slide PNGs + contact sheet), `scripts/palette.py` (measured palette with roles).
- Deck order of work: presentation-writing (story) -> academic-pptx rules if it is coursework -> slide-taste (idea + look) -> builder (`ppt-master` or `frontend-slides`) -> slide-taste look-and-fix (render, critique, fix top 3, max 3 rounds).
- PowerPoint templates live in `templates/<name>/`. **Raw Grid** (`templates/rawgrid/`) is the user's chosen PowerPoint look (2026-10-22): sample deck, component kit deck, `kit/rawgrid.py` (chain, Merkle, network waves, steps, doughnut, terminal, text effects, icons, all as PPT Master-ready SVG), fonts (Segoe UI Black + Noto Sans TC Black). PPT Master brand `raw-grid` is registered. Library icons are in PPT Master as `fsc-line/*` and `fsc-char/*` (`kit/export_icons.js` re-exports them). Local PPT Master patches: `EA_FONTS` in `scripts/svg_to_pptx/drawingml/utils.py`, `_SYNC_LIBRARIES` in `scripts/icon_sync.py` (re-apply after updates). **Bitgrid** (`templates/bitgrid/`) was an earlier mixed-style experiment the user dropped; don't use it unless asked.
- Deck routing: HTML deck -> `frontend-slides`; PowerPoint -> `ppt-master`. Taste Skill and Impeccable advise on both. The user's brand wins any conflict.
