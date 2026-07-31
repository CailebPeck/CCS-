#!/usr/bin/env python3
"""Generates www/img/brand/wordmark.svg with the Brothers lettering converted
to outlines.

Kept separate from generate-art.js because it needs the real font file:
SVG <text> does not pick up a webfont when the SVG is loaded through an <img>
tag, which is how the app uses these marks. Converting the glyphs to <path>
data makes the lockup render in Brothers everywhere — app, website, offline,
and in any exported PNG.

Run: python3 tools/generate-wordmark.py   (needs: pip install fonttools)
"""

import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "brothers.otf")
OUT_DIR = os.path.join(HERE, "..", "www", "img", "brand")

RED = "#d0181f"
BONE = "#f5f5f2"


def layout(font, text, size, letter_spacing=0.0):
    """Returns (path_data, advance_width) for text rendered at `size` units,
    with the glyphs positioned along a baseline at y=0."""
    upem = font["head"].unitsPerEm
    scale = size / upem
    cmap = font.getBestCmap()
    glyphset = font.getGlyphSet()
    hmtx = font["hmtx"]

    parts = []
    x = 0.0
    for ch in text:
        name = cmap.get(ord(ch))
        if name is None:
            x += size * 0.4
            continue
        pen = SVGPathPen(glyphset)
        glyphset[name].draw(pen)
        d = pen.getCommands()
        if d:
            # Flip Y: font space is y-up, SVG is y-down.
            parts.append(
                f'<g transform="translate({x:.2f},0) scale({scale:.5f},{-scale:.5f})">'
                f'<path d="{d}"/></g>'
            )
        x += hmtx[name][0] * scale + letter_spacing
    if text:
        x -= letter_spacing
    return "".join(parts), x


def build(font, top_fill, bot_fill):
    top, top_w = layout(font, "COASTLINE", 62, 2)
    bot, bot_w = layout(font, "CURRENT SOLUTIONS", 23, 7)

    pad_x, pad_y = 26, 24
    gap = 14
    w = max(top_w, bot_w) + pad_x * 2
    h = pad_y * 2 + 62 + gap + 23

    top_y = pad_y + 62
    bot_y = top_y + gap + 23

    return w, h, f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="Coastline Current Solutions">
<g fill="{top_fill}" transform="translate({(w - top_w) / 2:.2f},{top_y:.2f})">{top}</g>
<g fill="{bot_fill}" transform="translate({(w - bot_w) / 2:.2f},{bot_y:.2f})">{bot}</g>
</svg>"""


def main():
    font = TTFont(FONT)
    os.makedirs(OUT_DIR, exist_ok=True)

    # wordmark     — for dark backgrounds (the app's default)
    # wordmark-red — for light backgrounds
    for name, fills in [("wordmark", (BONE, RED)), ("wordmark-red", (RED, BONE))]:
        w, h, svg = build(font, *fills)
        path = os.path.join(OUT_DIR, name + ".svg")
        with open(path, "w") as fh:
            fh.write(svg)
        print(f"wrote www/img/brand/{name}.svg  ({w:.0f}x{h:.0f})")


if __name__ == "__main__":
    main()
