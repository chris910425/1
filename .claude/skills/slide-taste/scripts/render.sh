#!/usr/bin/env bash
# Render a deck to one PNG per slide plus a contact sheet (sheet.png).
#   bash render.sh <deck.pptx | deck.pdf | deck.html | svg_output_dir> [out_dir]
# pptx: LibreOffice -> PDF -> PNG. 繁體 text renders with Noto Sans TC standing in for
# Microsoft JhengHei (installed on first run), so shapes match the PowerPoint fonts' metrics closely.
# html: headless Chromium at 1920x1080, one screenshot per .slide (needs playwright: see below).
set -euo pipefail
IN="$1"; OUT="${2:-$(dirname "$IN")/render}"
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../../../.." && pwd)"
mkdir -p "$OUT"; rm -f "$OUT"/slide-*.png "$OUT"/sheet.png

ensure_cjk_font() {
  fc-list | grep -qi "Noto Sans TC" && return
  local tmp; tmp="$(mktemp -d)"
  (cd "$tmp" && npm pack @expo-google-fonts/noto-sans-tc >/dev/null 2>&1 && tar xzf ./*.tgz)
  mkdir -p ~/.fonts ~/.config/fontconfig
  cp "$tmp"/package/400Regular/*.ttf "$tmp"/package/700Bold/*.ttf ~/.fonts/
  cat > ~/.config/fontconfig/fonts.conf <<'XML'
<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>
<alias binding="same"><family>Microsoft JhengHei</family><prefer><family>Noto Sans TC</family></prefer></alias>
<alias binding="same"><family>微軟正黑體</family><prefer><family>Noto Sans TC</family></prefer></alias>
</fontconfig>
XML
  fc-cache -f >/dev/null 2>&1 || true
}

pdf_to_png() { pdftoppm -r 96 -png "$1" "$OUT/slide"; for f in "$OUT"/slide-*.png; do n=$(echo "$f" | sed -E 's/.*slide-0*([0-9]+)\.png/\1/'); mv "$f" "$OUT/slide-$(printf %02d "$n").png" 2>/dev/null || true; done; }

case "$IN" in
  *.pptx|*.ppt|*.odp)
    ensure_cjk_font
    tmp="$(mktemp -d)"; cp "$IN" "$tmp/deck.${IN##*.}"
    (cd "$tmp" && timeout 300 soffice --headless --convert-to pdf "deck.${IN##*.}" >/dev/null 2>&1)
    pdf_to_png "$tmp/deck.pdf" ;;
  *.pdf) pdf_to_png "$IN" ;;
  *.html|*.htm)
    ensure_cjk_font
    NODE_PATH="$ROOT/tools/record-motion/node_modules" node "$HERE/render_html.js" "$IN" "$OUT" ;;
  *)
    if [ -d "$IN" ]; then   # PPT Master svg_output/: one SVG per slide
      i=0; for s in "$IN"/*.svg; do i=$((i+1)); rsvg-convert -w 1280 "$s" -o "$OUT/slide-$(printf %02d $i).png" 2>/dev/null \
        || python3 -c "import sys;print('install librsvg2-bin for svg folders')"; done
    else echo "unsupported input: $IN" >&2; exit 1; fi ;;
esac

python3 - "$OUT" <<'PY'
import sys, glob
from PIL import Image
out = sys.argv[1]; fs = sorted(glob.glob(out + "/slide-*.png"))
if not fs: sys.exit("no slides rendered")
cols = 3 if len(fs) > 4 else 2; w = 420
ims = [Image.open(f).convert("RGB") for f in fs]; h = int(w * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + 12) + 12, rows * (h + 12) + 12), (128, 128, 128))
for i, im in enumerate(ims):
    sheet.paste(im.resize((w, h)), (12 + (i % cols) * (w + 12), 12 + (i // cols) * (h + 12)))
sheet.save(out + "/sheet.png"); print(f"{len(fs)} slides -> {out}/slide-NN.png + sheet.png")
PY
