"""Build components/gallery.html: inline the brand tokens and the library
into a single self-contained file. Run after editing library.css/js:

    python3 .claude/skills/frontend-slides/components/build.py
"""
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent


def inline(src: str) -> str:
    def repl(m):
        path = (HERE / m.group(1)).resolve()
        body = path.read_text()
        tag = "script" if path.suffix == ".js" else "style"
        return f"<{tag}>\n/* inlined from {m.group(1)} */\n{body}\n</{tag}>"
    # A BUILD:INLINE marker replaces itself and the <link>/<script src> on the next line
    return re.sub(r"<!-- BUILD:INLINE (\S+) -->\n\s*<(?:link|script)[^\n]*\n", lambda m: repl(m) + "\n", src)


src = (HERE / "gallery.src.html").read_text()
(HERE / "gallery.html").write_text(inline(src))
print("wrote", HERE / "gallery.html")
