# Social card for katoptra.org: the favicon K on the brand ground, at the
# 1200x630 every unfurler crops to. Two variants -- the mark alone, or the mark
# over the wordmark. Geometry mirrors static/favicon.svg; the wordmark uses the
# theme's own webfonts, decompressed from woff2 in memory.
# Run: uv run --with pillow --with 'fonttools[woff]' brand/render_og_image.py [--wordmark] [--out PATH]
import argparse
import io
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

W, H, SS = 1200, 630, 2                  # output px, supersample factor
BG = (0x17, 0x19, 0x1C, 255)
FG = (0xFF, 0xFF, 0xFF, 255)
MUTED = (0x9A, 0x9F, 0xA6, 255)

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "themes" / "ijosh" / "static" / "fonts"


def font(name: str, size: float) -> ImageFont.FreeTypeFont:
    """Pillow needs sfnt; the theme ships woff2, so strip the compression."""
    buf = io.BytesIO()
    f = TTFont(FONTS / name)
    f.flavor = None
    f.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def draw_k(d: ImageDraw.ImageDraw, cx: float, top: float, height: float) -> None:
    """M34 28 V76 M66 28 L36 54 L66 76, round caps -- the favicon path.
    Height is the inked bbox (viewBox y 21.5..82.5 once the stroke is counted)."""
    s = height / 61.0
    w = 13 * s
    ox, oy = cx - 50 * s, top - 21.5 * s

    def pt(x, y):
        return (ox + x * s, oy + y * s)

    def seg(a, b):
        d.line([pt(*a), pt(*b)], fill=FG, width=round(w))
        for p in (a, b):                 # round caps, and the shared round join
            x, y = pt(*p)
            d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=FG)

    seg((34, 28), (34, 76))
    seg((66, 28), (36, 54))
    seg((36, 54), (66, 76))


def tracked(d, text, fnt, cx, top, tracking, fill):
    """Pillow has no letter-spacing; the brand type is spaced, so place per glyph."""
    widths = [d.textlength(ch, font=fnt) for ch in text]
    x = cx - (sum(widths) + tracking * (len(text) - 1)) / 2
    for ch, cw in zip(text, widths):
        d.text((x, top), ch, font=fnt, fill=fill)
        x += cw + tracking


def render(wordmark: bool) -> Image.Image:
    img = Image.new("RGBA", (W * SS, H * SS), BG)
    d = ImageDraw.Draw(img)
    cx = W * SS / 2
    if wordmark:
        draw_k(d, cx, 132 * SS, 196 * SS)
        tracked(d, "KATOPTRA", font("graduate-400-latin.woff2", 72 * SS),
                cx, 386 * SS, 0.2 * 72 * SS, FG)
        tracked(d, "VERIFIED OPEN-SOURCE SOFTWARE MIRRORS",
                font("montserrat-400-latin.woff2", 24 * SS),
                cx, 492 * SS, 0.12 * 24 * SS, MUTED)
    else:
        draw_k(d, cx, (H - 300) / 2 * SS, 300 * SS)
    return img.resize((W, H), Image.LANCZOS)


p = argparse.ArgumentParser()
p.add_argument("--wordmark", action="store_true", help="mark over the wordmark")
p.add_argument("--out", type=Path, default=ROOT / "static" / "images" / "og.png")
a = p.parse_args()

a.out.parent.mkdir(parents=True, exist_ok=True)
render(a.wordmark).convert("RGB").save(a.out, optimize=True)
print(f"wrote {a.out}")
