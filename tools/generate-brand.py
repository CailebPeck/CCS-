#!/usr/bin/env python3
"""Builds every brand asset in the app from the vector masters in brand-source/.

Run: python3 tools/generate-brand.py
Needs: poppler-utils (pdftocairo) and pillow.

The masters are the real logo files from the designer, so everything derived
here — app icon, splash, in-app marks — stays consistent with the printed
branding and can be rebuilt if the logo is ever revised.

Why raster and not SVG: converting the masters to SVG works, but the wave is
so path-heavy that the result is ~190 KB per mark. The app shows the roundel at
96px and 34px, where a 512px WebP is both far smaller and pixel-identical. The
PDFs stay in the repo as the scalable source of truth.
"""

import os
import subprocess
import sys
import tempfile

try:
    from PIL import Image
except ImportError:
    sys.exit("pillow is required:  pip install pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
SRC = os.path.join(ROOT, "brand-source")
IMG = os.path.join(ROOT, "www", "img", "brand")
ASSETS = os.path.join(ROOT, "assets")

DPI = 600         # master render resolution
BONE = (245, 245, 242)
DARK = (11, 11, 11)


def render(pdf, out):
    """Renders a PDF's single page to a transparent PNG at DPI."""
    subprocess.run(
        ["pdftocairo", "-png", "-transp", "-r", str(DPI), "-singlefile", pdf, out],
        check=True, capture_output=True,
    )
    return Image.open(out + ".png")


def find_gap(im):
    """Row where the stacked lockup separates into roundel and wordmark.

    Measured rather than hardcoded: the bolt's tail hangs below the circle, so
    a fixed fraction slices through it and leaves a fragment stranded in the
    wordmark crop. This finds the tallest fully-transparent band instead, which
    self-corrects if the artwork is ever revised.
    """
    alpha = im.getchannel("A")
    rows = [alpha.crop((0, y, im.width, y + 1)).getbbox() is None
            for y in range(im.height)]
    box = im.getbbox()
    best, run = None, None
    for y in range(box[1], box[3]):
        if rows[y]:
            run = y if run is None else run
        elif run is not None:
            if best is None or y - run > best[1] - best[0]:
                best = (run, y)
            run = None
    if best is None:
        raise SystemExit("could not find the gap in the stacked lockup")
    return (best[0] + best[1]) // 2


def recolour(im, rgb):
    """Replaces every visible pixel with `rgb`, keeping the alpha shape.

    The wordmark is a single flat colour, so keying off alpha reproduces it
    exactly in another colourway — needed because the master is black, which
    is invisible against the app's near-black background.
    """
    solid = Image.new("RGBA", im.size, rgb + (255,))
    solid.putalpha(im.getchannel("A"))
    return solid


def trim(im, top=None, bottom=None):
    """Crops to the non-transparent content, optionally within a row band."""
    band = im.crop((0, top or 0, im.width, bottom or im.height))
    box = band.getbbox()          # alpha-aware for RGBA
    if box is None:
        raise SystemExit("no content found in band")
    x0, y0, x1, y1 = box
    off = top or 0
    return im.crop((x0, off + y0, x1, off + y1))


def fit(im, size, background=None, pad=0.0):
    """Centres im on a square canvas of `size`, leaving `pad` fraction free."""
    canvas = Image.new("RGBA", (size, size), (background or (0, 0, 0, 0)))
    inner = int(size * (1 - pad * 2))
    w, h = im.size
    scale = min(inner / w, inner / h)
    r = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    canvas.paste(r, ((size - r.width) // 2, (size - r.height) // 2), r)
    return canvas


def save_webp(im, path, width):
    h = max(1, round(im.height * width / im.width))
    im.resize((width, h), Image.LANCZOS).save(path, "WEBP", quality=92, method=6)
    print(f"  {os.path.relpath(path, ROOT):<40} {width}x{h}  {os.path.getsize(path) // 1024} KB")


def main():
    for d in (IMG, ASSETS):
        os.makedirs(d, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        stacked = render(os.path.join(SRC, "CCS_Logo_Stacked.pdf"), os.path.join(tmp, "st"))
        badge_pg = render(os.path.join(SRC, "CCS_Logo_Round.pdf"), os.path.join(tmp, "bd"))

        split = find_gap(stacked)
        roundel = trim(stacked, bottom=split)
        wordmark = trim(stacked, top=split)
        badge = trim(badge_pg)
        print(f"stacked lockup splits at row {split} of {stacked.height}")

        print("in-app marks:")
        save_webp(roundel, os.path.join(IMG, "roundel.webp"), 512)
        save_webp(badge, os.path.join(IMG, "badge.webp"), 768)
        # The master wordmark is black. Ship both colourways so the lockup
        # works on the app's dark chrome as well as on light ground.
        save_webp(recolour(wordmark, BONE), os.path.join(IMG, "wordmark.webp"), 1024)
        save_webp(wordmark, os.path.join(IMG, "wordmark-dark.webp"), 1024)

        # PWA icons, referenced by www/manifest.json for "Add to Home Screen".
        # Maskable variants keep 20% safe padding so a launcher can crop the
        # square to a circle without clipping the mark.
        print("pwa icons:")
        for px in (192, 512):
            p = os.path.join(IMG, f"icon-{px}.png")
            fit(roundel, px, background=(255, 255, 255, 255)).convert("RGB").save(p)
            print(f"  {os.path.relpath(p, ROOT):<40} {px}x{px}  {os.path.getsize(p) // 1024} KB")
            m = os.path.join(IMG, f"icon-{px}-maskable.png")
            fit(roundel, px, background=(255, 255, 255, 255), pad=0.2).convert("RGB").save(m)
            print(f"  {os.path.relpath(m, ROOT):<40} {px}x{px}  {os.path.getsize(m) // 1024} KB")

        print("store assets:")
        # App Store icons must be fully opaque, so the mark sits on white —
        # the same ground the printed branding uses, and the black outer ring
        # would otherwise disappear into a dark tile.
        icon = fit(roundel, 1024, background=(255, 255, 255, 255), pad=0.08)
        icon.convert("RGB").save(os.path.join(ASSETS, "icon.png"))
        print(f"  {'assets/icon.png':<40} 1024x1024  "
              f"{os.path.getsize(os.path.join(ASSETS, 'icon.png')) // 1024} KB")

        # Splash matches the app's launch background so there is no white flash.
        splash = fit(roundel, 2732, background=DARK + (255,), pad=0.34)
        for name in ("splash.png", "splash-dark.png"):
            splash.convert("RGB").save(os.path.join(ASSETS, name))
            print(f"  {'assets/' + name:<40} 2732x2732  "
                  f"{os.path.getsize(os.path.join(ASSETS, name)) // 1024} KB")


if __name__ == "__main__":
    main()
