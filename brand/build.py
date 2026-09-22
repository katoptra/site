# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow==12.3.0", "fonttools[woff]==4.65.0"]
# ///
# The katoptra mark and everything cut from it. One geometry, drawn here and nowhere
# else: two chevrons meeting at a hairline mirror plane, on a rounded tile. This
# script writes the SVGs, the PNGs, the favicons, the social card and the token sheet
# under static/, so a change to the mark is a change to MARK below and a rebuild.
#
#   uv run brand/build.py          write every file
#   uv run brand/build.py --check  rebuild in memory and fail if any file differs
#
# Pillow has no SVG renderer, so the raster files are drawn from the same numbers:
# line segments with a disc at each vertex for the round caps and joins, at a
# supersample, then downscaled. Versions are pinned above because the check compares
# bytes and a resampler change would fail it.
import argparse
import io
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"
BRAND = STATIC / "brand"

# ---- the palette, light then dark; the mark takes the tile and inks of its ground ----
LIGHT = {
    "bg": "#f6f5f2", "text": "#1c1c28", "text-body": "#4b4b5a", "text-muted": "#7a7a8a",
    "accent": "#4f5cff", "pill-bg": "rgba(28, 28, 40, 0.1)",
    "mark-tile": "#1c1c28", "mark-ink": "#ff5c8a", "mark-ink2": "#5cc8ff", "mark-line": "#ffffff",
}
DARK = {
    "bg": "#121218", "text": "#f0f0f5", "text-body": "#c2c2d0", "text-muted": "#8b8b9c",
    "accent": "#8b93ff", "pill-bg": "rgba(255, 255, 255, 0.1)",
    "mark-tile": "#262633", "mark-ink": "#ff6b95", "mark-ink2": "#6fd0ff", "mark-line": "#ffffff",
}

# ---- the mark, in a 100-unit box ----
MARK = {
    "radius": 22,                                  # tile corner, as a share of the box
    "line": ((50, 24), (50, 76)),                  # the mirror plane, width 2, white at 45%
    "line_width": 2, "line_alpha": 0.45,
    "left": ((22, 30), (41, 50), (22, 70)),        # upstream, in the first ink
    "right": ((78, 30), (59, 50), (78, 70)),       # the copy, in the second ink
    "stroke": 9,
}

TAGLINE = "VERIFIED OPEN-SOURCE SOFTWARE MIRRORS"


def hex_rgb(h: str) -> tuple[int, int, int]:
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def blend(a: str, b: str, t: float) -> tuple[int, int, int]:
    """a with t of b mixed in; how the translucent hairline lands on an opaque tile."""
    return tuple(round(x + (y - x) * t) for x, y in zip(hex_rgb(a), hex_rgb(b)))


def svg(p: dict, rounded: bool = True) -> str:
    m = MARK
    rx = f' rx="{m["radius"]}"' if rounded else ""
    path = lambda pts: "M" + "L".join(f"{x} {y}" for x, y in pts)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Katoptra">'
        f'<rect width="100" height="100"{rx} fill="{p["mark-tile"]}"/>'
        f'<path d="{path(m["line"])}" stroke="{p["mark-line"]}" stroke-opacity="{m["line_alpha"]}" '
        f'stroke-width="{m["line_width"]}" stroke-linecap="round"/>'
        f'<path d="{path(m["left"])}" fill="none" stroke="{p["mark-ink"]}" stroke-width="{m["stroke"]}" '
        'stroke-linecap="round" stroke-linejoin="round"/>'
        f'<path d="{path(m["right"])}" fill="none" stroke="{p["mark-ink2"]}" stroke-width="{m["stroke"]}" '
        'stroke-linecap="round" stroke-linejoin="round"/>'
        "</svg>\n"
    )


def draw_mark(d: ImageDraw.ImageDraw, ox: float, oy: float, s: float, p: dict, rounded: bool = True) -> None:
    """The mark with its top-left corner at (ox, oy), s pixels per unit."""
    m = MARK
    pt = lambda xy: (ox + xy[0] * s, oy + xy[1] * s)

    def polyline(pts, width, fill):
        w = width * s
        for a, b in zip(pts, pts[1:]):
            d.line([pt(a), pt(b)], fill=fill, width=round(w))
        for v in pts:                        # round caps at the ends, a round join between
            x, y = pt(v)
            d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=fill)

    box = [ox, oy, ox + 100 * s, oy + 100 * s]
    if rounded:
        d.rounded_rectangle(box, radius=m["radius"] * s, fill=hex_rgb(p["mark-tile"]))
    else:
        d.rectangle(box, fill=hex_rgb(p["mark-tile"]))
    polyline(m["line"], m["line_width"], blend(p["mark-tile"], p["mark-line"], m["line_alpha"]))
    polyline(m["left"], m["stroke"], hex_rgb(p["mark-ink"]))
    polyline(m["right"], m["stroke"], hex_rgb(p["mark-ink2"]))


def mark_png(size: int, p: dict, rounded: bool = True, ss: int = 4) -> Image.Image:
    img = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    draw_mark(ImageDraw.Draw(img), 0, 0, size * ss / 100, p, rounded)
    return img.resize((size, size), Image.LANCZOS)


def font(name: str, size: float) -> ImageFont.FreeTypeFont:
    """Pillow needs sfnt; the site ships woff2, so strip the compression in memory."""
    buf = io.BytesIO()
    f = TTFont(STATIC / "fonts" / name)
    f.flavor = None
    f.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def tracked(d, text, fnt, cx, top, tracking, fill):
    """Pillow has no letter-spacing; the tagline is spaced, so place per glyph."""
    widths = [d.textlength(ch, font=fnt) for ch in text]
    x = cx - (sum(widths) + tracking * (len(text) - 1)) / 2
    for ch, cw in zip(text, widths):
        d.text((x, top), ch, font=fnt, fill=fill)
        x += cw + tracking


def og_png() -> Image.Image:
    """The 1200 x 630 unfurl card: the mark over the name and the tagline, on the dark ground."""
    W, H, SS = 1200, 630, 2
    p = DARK
    img = Image.new("RGB", (W * SS, H * SS), hex_rgb(p["bg"]))
    d = ImageDraw.Draw(img)
    cx = W * SS / 2
    size = 196 * SS
    draw_mark(d, cx - size / 2, 128 * SS, size / 100, p)
    name = font("gabarito-700-latin.woff2", 76 * SS)
    d.text((cx, 392 * SS), "Katoptra", font=name, fill=hex_rgb(p["text"]), anchor="ma")
    tracked(d, TAGLINE, font("gabarito-400-latin.woff2", 22 * SS), cx, 500 * SS, 0.14 * 22 * SS,
            hex_rgb(p["text-muted"]))
    return img.resize((W, H), Image.LANCZOS)


def tokens_css() -> str:
    """The palette as custom properties, in the theme's own three-state shape."""
    decl = lambda p: "".join(f"  --{k}: {v};\n" for k, v in p.items())
    return (
        "/* The katoptra palette. Generated by brand/build.py from LIGHT and DARK there;\n"
        "   do not edit. Served at /brand/tokens.css and bundled into the site's own CSS,\n"
        "   where it overrides the theme's tokens. Set data-theme=\"light\" or \"dark\" on\n"
        "   <html> to override the system preference. */\n"
        ":root {\n  color-scheme: light;\n" + decl(LIGHT) + "}\n\n"
        "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) {\n"
        "    color-scheme: dark;\n" + decl(DARK).replace("  --", "    --") + "  }\n}\n\n"
        ":root[data-theme=\"dark\"] {\n  color-scheme: dark;\n" + decl(DARK) + "}\n"
    )


def png_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return buf.getvalue()


def ico_bytes() -> bytes:
    """16, 32 and 48, each drawn at its own size rather than downscaled from one."""
    frames = [mark_png(n, LIGHT, ss=8) for n in (48, 32, 16)]
    buf = io.BytesIO()
    frames[0].save(buf, "ICO", sizes=[f.size for f in frames], append_images=frames[1:])
    return buf.getvalue()


def outputs() -> dict[Path, bytes]:
    files = {
        BRAND / "katoptra-mark.svg": svg(LIGHT).encode(),
        BRAND / "katoptra-mark-dark.svg": svg(DARK).encode(),
        BRAND / "katoptra-avatar.svg": svg(LIGHT, rounded=False).encode(),
        BRAND / "katoptra-avatar.png": png_bytes(mark_png(1024, LIGHT, rounded=False, ss=2)),
        BRAND / "tokens.css": tokens_css().encode(),
        ROOT / "assets" / "css" / "tokens.css": tokens_css().encode(),
        STATIC / "favicon.svg": svg(LIGHT).encode(),
        STATIC / "favicon.ico": ico_bytes(),
        STATIC / "apple-touch-icon.png": png_bytes(mark_png(180, LIGHT, rounded=False)),
        STATIC / "images" / "og.png": png_bytes(og_png()),
    }
    for suffix, p in (("", LIGHT), ("-dark", DARK)):
        for size in (224, 1024):
            files[BRAND / f"katoptra-mark{suffix}-{size}.png"] = png_bytes(mark_png(size, p, ss=4 if size < 512 else 2))
    return files


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="fail if a rebuild differs from the committed files")
    check = ap.parse_args().check
    stale = []
    for path, data in outputs().items():
        rel = path.relative_to(ROOT)
        if check:
            if not path.exists() or path.read_bytes() != data:
                stale.append(str(rel))
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        print(f"{rel}: {len(data)} bytes")
    if stale:
        print("brand: out of date, run `uv run brand/build.py`:\n  " + "\n  ".join(stale), file=sys.stderr)
        return 1
    if check:
        print("check: brand files match a rebuild")
    return 0


if __name__ == "__main__":
    sys.exit(main())
