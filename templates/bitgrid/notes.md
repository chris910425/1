# Bitgrid template notes

- Asked for (2026-10-21): base on 8-Bit Orbit + Raw Grid + Retro Windows. Windows show terminal elements; Raw Grid is the main framework (arrows, fonts, progress bars, diagrams); combine the library's pie chart; 8-bit cover font style for titles; must work in PowerPoint with 繁體中文.
- Font decision: 8-bit Orbit's title font (Tektur) has no Chinese. Cubic 11 (俐方體11號, OFL, 10k glyphs incl. all common 繁體) covers both; thickened outline + half-pixel step shadow (full-pixel shadow was muddy).

```
ROUND 1 (2026-10-21)
Seen in one second: cover = the pixel title; content slides = the one framed object (window, steps, doughnut)
Idea (one sentence): the deck is a chain: slide tags are block heights, the cover loads a block, the closing saves one
Layout words: 1=cover 2=list 3=divider 4=split-window 5=process 6=chart 7=grid 8=windows 9=chain 10=dialog
Scores: design 8 · clarity 8 · idea 8 · content 6 → overall 7.8 (sample wording)
Caps applied: none
Top three problems (most visible first), each with slide number and the fix:
1. Slide 4: lower-left cell has spare room under the three points; a fourth point or a small diagram would fill it.
2. Slide 10: empty band above 謝謝; acceptable as a rest, could hold a pixel block motif.
3. Pixel-title outline is not drawn by LibreOffice previews; check thickness in real PowerPoint.
```
- 2026-10-22: user finds Cubic 11 ugly. Showed 8 title-font options (templates/bitgrid/font-options/), waiting for the pick. Next: library elements (chain, Merkle tree, gossip network, icons) for PowerPoint.
