# Slide Studio: how to work in this repo

This repo is the user's personal slide-making workspace. The user is an MSBT (blockchain) student at NTU, Singapore, and is not familiar with GitHub or code: handle all git/GitHub work for them and explain things in plain language.

## What's here

- `.claude/skills/frontend-slides/`: the slide-making skill, customized:
  - `brand/BRAND.md` + `brand/tokens.css`: the user's design system (themes **Ledger**, **Editorial**, **Terminal**, each light + dark). Every deck uses it by default.
  - `components/`: the reusable animated component library (see `components/README.md`). Preview page: `components/gallery.html` (rebuild with `python3 .claude/skills/frontend-slides/components/build.py`).
- `decks/`: one folder per deck: `decks/<deck-name>/`.

## The user's workflow (follow it)

The user works conversationally: they share thoughts, you suggest ideas, you go back and forth, make test drafts, and only then build the final deck.

1. **Brainstorm first.** When a new deck starts, do not generate slides until the user says so. Ask about purpose, audience, language and length, then suggest structure and ideas.
2. **Keep a notes file from the first message:** `decks/<deck-name>/notes.md`. Record the goal, audience, language, chosen theme, the outline, ideas (accepted and rejected), and open questions. Update it after every meaningful exchange so nothing is lost if the conversation is long or a new session continues the deck. At the start of any session on an existing deck, read its `notes.md` first.
3. **Test drafts on request:** build only the slides asked for, as `decks/<deck-name>/draft-N.html`, screenshot-check them, and share a preview (see below).
4. **Final deck:** `decks/<deck-name>/index.html`, built with the frontend-slides skill, the brand system and the component library. Use components only where they help.
5. **Save often:** commit and push at each checkpoint (notes updated, draft made, final made) with clear messages, so the user never loses work.

## Previews

The user views work on a phone and on the Claude desktop app on a PC. Always share drafts and decks in a way that opens on both: publish them as a private Artifact link (and update the same link for new versions), in addition to sending the file.

## Language

Decks may be in Traditional Chinese (繁體中文). Copy the user's wording exactly; never convert to Simplified. Add a matching Traditional Chinese web font (e.g. Noto Sans TC / Noto Serif TC), relax tight letter-spacing and uppercase styles for Chinese text, and use full-width punctuation. Ask whether terminology should follow Taiwan or Hong Kong usage.

## Changing the system

If the user wants a new component, icon, effect or brand tweak, add it to the library or brand files (not just the one deck), rebuild the gallery, check it in all three themes, and say it is now available for future decks.

## Git

- Work on a branch per deck (e.g. `deck/<deck-name>`), or on the branch the session provides. When the user is happy with a deck, merge it into `main` for them.
- Changes to the skill, brand or library must end up in `main` so future decks get them.
