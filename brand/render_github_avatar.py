# GitHub org avatar: the favicon K on a full-bleed square. GitHub clips avatars
# to its own radius, so the icon's rounded corners would show as a halo inside
# that clip; the square lets GitHub's rounding be the only rounding.
# Run: uv run --with pillow brand/render_github_avatar.py
# Geometry mirrors static/favicon.svg -- change both together.
from pathlib import Path
from PIL import Image, ImageDraw

SIZE, SS = 1024, 4                       # output px, supersample factor
BG, FG = (0x17, 0x19, 0x1c, 255), (255, 255, 255, 255)
S = SIZE * SS / 100                      # viewBox unit -> px
W = 13 * S                               # stroke-width

img = Image.new("RGBA", (SIZE * SS, SIZE * SS), BG)
d = ImageDraw.Draw(img)

def seg(a, b):                           # round-capped stroke
    d.line([(a[0]*S, a[1]*S), (b[0]*S, b[1]*S)], fill=FG, width=int(W))
    for x, y in (a, b):
        d.ellipse([x*S - W/2, y*S - W/2, x*S + W/2, y*S + W/2], fill=FG)

seg((34, 28), (34, 76))                  # M34 28 V76
seg((66, 28), (36, 54))                  # M66 28 L36 54
seg((36, 54), (66, 76))                  # L66 76 (round join = shared cap)

out = Path(__file__).with_name("github-avatar.png")
img.resize((SIZE, SIZE), Image.LANCZOS).save(out, optimize=True)
print(f"wrote {out}")
