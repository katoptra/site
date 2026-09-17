# CTAN icon for the upstream link on the CTAN and tlnet tiles: ctan.org's favicon
# (a card tilted 45 degrees with CTAN knocked out of it, and the L of a second card
# behind it) redrawn in one color in Font Awesome's format -- 512 units tall, one
# path, currentColor -- so it takes the same size and grey as the icons beside it.
# Run: uv run --with shapely brand/render_ctan_icon.py [OUT]  (default assets/icons/ctan.svg)
import sys
from shapely.geometry import LineString, MultiPolygon, Polygon, box
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
from shapely import affinity
import math

W, H, R = 360, 270, 14          # card, in the text's frame (y down)
CAP, S, LW, GAP = 124, 23, 68, 12  # cap height, stroke, letter width, letter gap
BAND, BAND_GAP = 30, 26          # the back card's strip and its gap from the front card

card = box(-W / 2 + R, -H / 2 + R, W / 2 - R, H / 2 - R).buffer(R, quad_segs=8)

def stroke(points, join="mitre"):
    return LineString(points).buffer(S / 2, cap_style="flat", join_style=join, mitre_limit=6)

def letter(ch, cx):
    t, b, l, r = -CAP / 2, CAP / 2, cx - LW / 2, cx + LW / 2
    h = S / 2
    if ch == "C":
        rx, ry = LW / 2 - h, CAP / 2 - h
        pts = [(cx + rx * math.cos(math.radians(a)), ry * math.sin(math.radians(a))) for a in range(48, 313, 3)]
        g = stroke(pts, "round")
    elif ch == "T":
        g = stroke([(l, t + h), (r, t + h)]).union(stroke([(cx, t), (cx, b)]))
    elif ch == "A":
        x0, y = l + h * 1.15, CAP * 0.2
        xl = x0 + (cx - x0) * (b - y) / (b - t)
        g = stroke([(x0, b), (cx, t - S), (2 * cx - x0, b)]).union(stroke([(xl, y), (2 * cx - xl, y)]))
    elif ch == "N":
        g = stroke([(l + h, b + S), (l + h, t), (r - h, b), (r - h, t - S)])
    return g.intersection(box(l, t, r, b))

span = 4 * LW + 3 * GAP
text = unary_union([letter(ch, -span / 2 + LW / 2 + i * (LW + GAP)) for i, ch in enumerate("CTAN")])
front = card.difference(text)

off = BAND_GAP + BAND
back = affinity.translate(card, off, off).difference(card.buffer(BAND_GAP, quad_segs=8))

shape = affinity.rotate(unary_union([front, back]), -45, origin=(0, 0))

# Fit to Font Awesome's frame: 512 units tall, glyph from 16 to 496.
minx, miny, maxx, maxy = shape.bounds
k = 480 / (maxy - miny)
shape = affinity.translate(affinity.scale(shape, k, k, origin=(0, 0)), 0, 0)
minx, miny, maxx, maxy = shape.bounds
shape = affinity.translate(shape, 16 - minx, 16 - miny)
width = round(maxx - minx + 32)

polys = shape.geoms if isinstance(shape, MultiPolygon) else [shape]
def ring(coords):
    pts = [f"{x:.1f} {y:.1f}".replace(".0 ", " ").replace(".0", "") for x, y in list(coords)[:-1]]
    return "M" + "L".join(pts) + "Z"
d = ""
for p in polys:
    p = orient(p.simplify(0.4), 1.0)
    d += ring(p.exterior.coords) + "".join(ring(i.coords) for i in p.interiors)

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="{d}"/></svg>\n'
out = sys.argv[1] if len(sys.argv) > 1 else "assets/icons/ctan.svg"
open(out, "w").write(svg)
print(f"{out}: {width}x512, {len(svg)} bytes")
