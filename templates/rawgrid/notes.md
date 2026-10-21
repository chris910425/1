# Raw Grid template notes

- Asked for (2026-10-22): stick to Raw Grid only; 繁體 fonts that look like Raw Grid's; transform library elements (chain, Merkle tree, propagation nodes, doughnut, text effects as static, icons) to fit Raw Grid; must work with PPT Master.
- Fonts: Segoe UI Black + Noto Sans TC Black (A). Options B Chiron Hei HK Black, C Microsoft JhengHei Bold shown in font-options/.
- Integration: brand `raw-grid` registered in PPT Master; icons `fsc-line`/`fsc-char` in PPT Master's icon library; kit/rawgrid.py prints PPT Master-ready SVG.

```
ROUND 1 (2026-10-22, sample deck)
Seen in one second: cover = the black title on pink; content slides = the one diagram (chain, tree, network, doughnut)
Idea (one sentence): the deck is a chain (block-progress in every header); diagrams are the library's blockchain elements in Raw Grid language
Layout words: cover / statement / chapter / chain / tree / network ×3 (a deliberate Morph build) / steps / chart / text / terminal / icons / closing
Scores: design 8 · clarity 8 · idea 8 · content 6 → overall 7.8 (sample wording)
Caps applied: none (the 3 network slides are one build, not repetition)
Top three problems:
1. Chain/Merkle mono labels are small (14–21px); fine on a projector at 1280 canvas but don't go smaller.
2. Slide 2 left column has spare space below the paragraph; a real deck can hold a source line or a third sentence.
3. Real PowerPoint not checked yet (Segoe UI Black only exists on Windows): user to open and report.
```
