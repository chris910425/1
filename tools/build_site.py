"""Build the public GitHub Pages site into _site/.

Published:  every deck in decks/ (single .html files or folders with index.html + their own images),
            plus the studio previews (themes, component gallery, fonts).
Not published: notes.md files, inspiration/, assets/ (shared photos may belong to others).
Run locally: python3 tools/build_site.py
"""
import html, pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"
SKILL = ROOT / ".claude/skills/frontend-slides"

shutil.rmtree(OUT, ignore_errors=True)
(OUT / "decks").mkdir(parents=True)

def title_of(p):
    m = re.search(r"<title>(.*?)</title>", p.read_text(errors="ignore"), re.S)
    return html.unescape(m.group(1).strip()) if m else p.stem

decks = []
for p in sorted((ROOT / "decks").iterdir()):
    if p.is_file() and p.suffix == ".html":
        shutil.copy(p, OUT / "decks" / p.name)
        decks.append((title_of(p), f"decks/{p.name}"))
    elif p.is_dir() and (p / "index.html").exists():
        shutil.copytree(p, OUT / "decks" / p.name, ignore=shutil.ignore_patterns("*.md", "draft-*.html"))
        decks.append((title_of(p / "index.html"), f"decks/{p.name}/"))

studio = OUT / "studio"; studio.mkdir()
extras = [("Component library", SKILL / "components/gallery.html", "gallery.html"),
          ("Font pairings", SKILL / "brand/fonts.html", "fonts.html")]
for t in sorted((SKILL / "brand/themes").glob("*.html")):
    extras.append((f"Theme · {t.stem.title()}", t, f"theme-{t.stem}.html"))
links = []
for label, src, name in extras:
    if src.exists():
        shutil.copy(src, studio / name); links.append((label, f"studio/{name}"))

li = lambda items: "\n".join(f'<li><a href="{h}">{html.escape(t)}</a></li>' for t, h in items) or "<li class=empty>No decks yet</li>"
(OUT / "index.html").write_text(f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Slide Studio</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500&display=swap">
<style>:root{{--bg:#f3f1ec;--ink:#1b1b1d;--muted:#77736d;--rule:rgba(0,0,0,.12)}}@media (prefers-color-scheme:dark){{:root{{--bg:#141415;--ink:#eeebe5;--muted:#8d8a85;--rule:rgba(255,255,255,.14)}}}}
*{{margin:0;box-sizing:border-box}}body{{background:var(--bg);color:var(--ink);font:17px/1.6 'DM Sans',sans-serif;padding:56px 16px}}main{{max-width:760px;margin:0 auto}}
h1{{font:400 clamp(40px,8vw,72px)/1 'Instrument Serif',serif}}h2{{margin:48px 0 12px;font:500 13px 'DM Sans';letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}}
ul{{list-style:none;padding:0;border-top:1px solid var(--rule)}}li{{border-bottom:1px solid var(--rule)}}a{{display:block;padding:16px 4px;color:inherit;text-decoration:none}}a:hover{{padding-left:10px;transition:.2s}}.empty{{padding:16px 4px;color:var(--muted)}}</style></head>
<body><main><h1>Slide Studio</h1><h2>Decks</h2><ul>{li(decks)}</ul><h2>Studio</h2><ul>{li(links)}</ul></main></body></html>""")
(OUT / ".nojekyll").write_text("")
print(f"built _site with {len(decks)} decks and {len(links)} studio pages")
