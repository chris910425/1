#!/bin/bash
# shoot.sh <svg_dir> <out_dir> : each SVG -> slide-NN.png at exactly 1280x720, plus sheet.png.
# The SVG is inlined into an HTML page so its external <image> files load (an SVG
# loaded through <img> will not fetch them), rendered in a taller window and cropped,
# because a window exactly 720 tall comes back short.
set -e
SVGDIR="$(cd "$1" && pwd)"; OUT="$2"; mkdir -p "$OUT"; rm -f "$OUT"/slide-*.png "$OUT"/sheet.png
CHROME=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | head -1)
i=0
for s in "$SVGDIR"/*.svg; do
  i=$((i+1)); n=$(printf %02d $i)
  { printf '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0}svg{display:block;width:1280px;height:720px}</style>\n'
    cat "$s"; } > "$SVGDIR/.shot.html"
  "$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1280,900 --screenshot="$OUT/slide-$n.png" \
    "file://$SVGDIR/.shot.html" >/dev/null 2>&1
  python3 -c "from PIL import Image;p='$OUT/slide-$n.png';Image.open(p).crop((0,0,1280,720)).save(p)"
done
rm -f "$SVGDIR/.shot.html"
python3 - "$OUT" <<'PY'
import sys, glob
from PIL import Image
out = sys.argv[1]; fs = sorted(glob.glob(out + "/slide-*.png"))
ims = [Image.open(f).convert("RGB") for f in fs]
cols = 2 if len(ims) <= 4 else 3; w = 560
h = int(w * ims[0].height / ims[0].width); rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + 12) + 12, rows * (h + 12) + 12), (128, 128, 128))
for i, im in enumerate(ims):
    sheet.paste(im.resize((w, h)), (12 + (i % cols) * (w + 12), 12 + (i // cols) * (h + 12)))
sheet.save(out + "/sheet.png"); print(f"{len(fs)} slides -> {out}/slide-NN.png + sheet.png")
PY
