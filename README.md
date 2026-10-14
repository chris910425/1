# Slide Studio

My workspace for making HTML slide decks with Claude Code.

## How to make a new deck

1. Open Claude Code (desktop app or claude.ai/code) and start a new session on this repo.
2. Tell Claude what the deck is about and that you want to brainstorm first, for example:
   > I'm making a deck about "Life in Singapore as an MSBT student", in 繁體中文. Let's brainstorm first.
3. Go back and forth with ideas. Claude keeps everything in `decks/<deck-name>/notes.md`.
4. Ask for test drafts any time ("make a draft of slides 1–3"). Claude sends a preview link.
5. When it's right, ask for the full deck. Claude saves it in `decks/<deck-name>/`.

Claude handles saving and GitHub for you.

## What's inside

- **Brand:** three looks (Ledger, Editorial, Terminal), each in light and dark mode.
- **Component library:** animated blockchain diagrams, charts (incl. candlesticks), Alice & Bob characters, finance and Singapore-life icons, hand-drawn text effects, and a continuous chain animation. Preview: `.claude/skills/frontend-slides/components/gallery.html`.
- **Example deck:** `decks/aurelia-gt.html`.
