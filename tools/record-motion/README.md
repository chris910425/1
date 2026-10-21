# Record a motion style as a PowerPoint clip

PowerPoint cannot run the web animations in `components/motion.js`, so we record them as short looping videos.

```bash
cd tools/record-motion && npm install          # once (playwright); ffmpeg must be installed
node tools/record-motion/record.js --style neon --text "Open Late" --sub SINGAPORE
python3 tools/record-motion/to_pptx.py clips/neon.mp4                     # new 1-slide deck
python3 tools/record-motion/to_pptx.py clips/neon.mp4 --append deck.pptx  # or add to a deck
```

- `record.js` options: `--style`, `--text`, `--sub`, `--theme ledger|editorial|terminal|index|slate|heritage`, `--dark`, `--seconds` (default: the style's own loop length, else 10), `--fps 30`, `--size 1920x1080`, `--out clips/<style>.mp4`.
- Every frame is rendered with the animation clock frozen, so the video is smooth on any machine. Output: H.264 MP4 (plays in PowerPoint on Windows and Mac) plus a `.png` poster frame.
- `to_pptx.py` places the clip full-bleed, muted, set to **start automatically and loop until the slide changes**.
- Seamless loops: `neon` 20 s, `particles` 7 s, `kinetic` 5 s, `blueprint` 7 s, `brutal` 6 s. Others record 10 s and may jump slightly at the loop point; pass `--seconds` to change.
- Text inside a clip cannot be edited in PowerPoint: re-record with new `--text`.
