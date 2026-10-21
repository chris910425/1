# Critique: judging the rendered slides

Adapted from Taste Skill's `critique.md` (a juror's passes and caps) and Impeccable's critique
vocabulary, for decks. Use it on `sheet.png` and the `slide-NN.png` files, never on the code: you wrote
the code and will read your intentions into it.

## 1. The passes

Make each pass on its own.

1. **One second (each slide).** Glance and look away. There should be one answer: a number, a word, a
   picture. "A slide with text" means no focal point.
2. **Squint (each slide).** Text becomes grey bars. Two or three masses, one clearly biggest? Many
   small equal masses means everything is medium.
3. **The idea (deck).** Cover the title slide's words. Could this deck be about any other topic or for
   any other school or company? Is the idea from `notes.md` visible beyond the cover, or does the deck
   turn into stock title-and-bullets after slide 2?
4. **Edges (deck).** On the contact sheet, follow the left edges and title positions across slides.
   Two or three repeated edges = composed. Titles jumping around = placed one at a time.
5. **Space.** Margins equal on every slide? Related things close, unrelated far? Any hole (empty by
   accident, usually beside a short column) rather than a rest?
6. **Type.** More than 3 sizes on a slide, or near-equal sizes doing different jobs? Display ÷ body
   under 3? Anything below the minimum sizes in SKILL.md §2? Orphan word or single CJK character on a
   last line? Paragraphs centred over more than two lines?
7. **Colour.** Name the shares: ground, ink, accent. Count where the accent appears per slide. Any
   text on a photo or field below 4.5:1?
8. **Pictures.** Real pictures where the subject needs them? One grade, one crop family? Anything
   stretched, low-resolution, with a watermark or garbled AI text?
9. **Sameness.** Write one layout word per slide (cover, statement, split, list, chart, full-bleed,
   quote, grid, timeline, divider…). Three in a row with the same word = template showing.
10. **Density.** Count body words per slide. Over 40 on a presented slide = a document, not a slide.
    Also the opposite: a slide that is only a heading and a hole is underbuilt.
11. **Substance.** Does every slide carry its claim completely (number + context + source; step +
    what happens)? Would a classmate who missed the talk get the point from the slide?
12. **Collisions.** Anything overlapping text, running off the slide, cut by the slide edge by
    accident, or covered by an animation's end state?
13. **Language.** 繁體 only (no Simplified characters), full-width punctuation, no negative tracking
    on CJK, the user's exact wording kept.

## 2. The score

Four criteria, 1–10, weighted **design 40%, clarity 30%, idea 20%, content 10%**.

- **Design:** composition, type, colour, pictures, craft. 9–10 every slide holds as a poster; 8
  confident, one or two soft spots; 7 clean and systematic; 6 tidy but anonymous (reads as a kit);
  ≤ 5 weak hierarchy, accidental spacing, default type.
- **Clarity:** each slide's point understood in five seconds from the back row. 9–10 effortless;
  8 one slow slide; 7 one real problem (small text, crowded chart); ≤ 6 you have to hunt.
- **Idea:** a concept from this subject carried through the deck. 9–10 specific and memorable; 8 one
  memorable move; 7 tasteful known approach; ≤ 6 the category default.
- **Content:** specific, true, edited words and evidence. ≤ 6 slogans, filler, generic titles.

`overall = 0.4·design + 0.3·clarity + 0.2·idea + 0.1·content`

Calibration: a good student deck lands 7–7.5; 8+ is strong professional work. If your first score for
your own deck is 9, score it again as the classmate who did not build it.

## 3. Caps (override the arithmetic)

- Any text below the minimum sizes, or text overlapping/cut off: clarity ≤ 6.
- A presented slide over 60 body words, or a bullet wall of 7+ lines: clarity ≤ 6.5.
- Three consecutive slides with the same layout word: design ≤ 6.5.
- Accent used on 4+ separate things on one slide, or several accent colours: design ≤ 7.
- Pass 3 fails (deck could be about anything): idea ≤ 6.
- Placeholder text, lorem, "Click to add title", grey boxes left in: content ≤ 5.
- Generic titles on most content slides ("Overview", "Background"): content ≤ 6.
- Mixed picture grades or a stretched / pixelated image: design ≤ 7.
- Any Simplified character in a 繁體 deck, or changed user wording: content ≤ 5.

## 4. The ROUND block

Write it into the deck's `notes.md` so rounds can be compared:

```
ROUND n (date)
Seen in one second (cover / weakest slide): …
Idea (one sentence): …
Layout words: 1=cover 2=… 3=… …
Scores: design _ · clarity _ · idea _ · content _ → overall _._
Caps applied: …
Top three problems (most visible first), each with slide number and the fix:
1. …
2. …
3. …
```

Name problems the way a designer would to a colleague: "slide 4: the takeaway sits 40px left of the
panel edge", "slides 5–7 are three splits in a row", "slide 2: four accent marks compete".
"Could be more polished" is not a finding.

## 5. Fix order

1. The idea. 2. Hierarchy: one dominant element per slide (make the big thing bigger, the small things
fewer). 3. Composition: shared edges, margins, layout variety, holes. 4. Type: sizes, breaks, CJK
rules. 5. Pictures: replace weak ones, unify grade and crop. 6. Colour: accent discipline, contrast.
7. Detail: alignment, footers, numbering. 8. Motion, last.

When removing something leaves a gap, do not refill it with an ornament: enlarge what remains, close
the gap, or let a picture or a colour field take the space (Impeccable's `distill`). If a slide is loud
and busy, apply `quieter` (fewer colours, fewer sizes, less decoration); if flat and timid, `bolder`
(bigger scale contrast, one strong picture or field).
