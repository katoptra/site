# The GNU icon for the upstream link on the GNU and Savannah tiles. It is the Bold GNU
# Head (Aurelio A. Heckert, copyright 2003 Free Software Foundation,
# https://www.gnu.org/graphics/heckert_gnu.html, GFDL 1.3, Free Art License or CC BY-SA
# 2.0). The source file is a vector of the mark from gnu.org, and the repository keeps
# it adjacent to this script as brand/heckert_gnu.svg. This script makes a copy of it in
# the format of Font Awesome (512 units tall, one path, currentColor). Thus, the icon has
# the same dimensions and the same gray color as the icons adjacent to it.
#
# The drawing is one even-odd path. The script flattens its curves into polygons and
# simplifies them, with the same method as the CTAN icon. The output has the same
# license as the source: CC BY-SA 2.0.
#
# To run it: uv run --with svgelements --with shapely brand/render_gnu_icon.py [OUT]
#      (the default OUT is assets/icons/gnu.svg)
import sys
from functools import reduce
from shapely.geometry import MultiPolygon, Polygon
from shapely.geometry.polygon import orient
from svgelements import SVG, Close, Matrix, Move, Path

SRC = "brand/heckert_gnu.svg"
paths = [e for e in SVG.parse(SRC, reify=True).elements() if isinstance(e, Path) and len(e) > 0]
assert len(paths) == 1, f"expected one path in {SRC}, found {len(paths)}"
head = paths[0]

# Scale to the frame of Font Awesome: 512 units tall, with the glyph from 16 to 496.
minx, miny, maxx, maxy = head.bbox()
k = 480 / (maxy - miny)
head = head * Matrix(f"translate({-minx}, {-miny})") * Matrix(f"scale({k})") * Matrix("translate(16, 16)")
head.reify()
width = round((maxx - minx) * k + 32)

# Each subpath is a ring. The even-odd fill is the symmetric difference of the rings.
rings = []
for sub in head.as_subpaths():
    pts = []
    for seg in sub:
        if isinstance(seg, Move):
            pts.append((seg.end.x, seg.end.y))
        elif not isinstance(seg, Close):
            pts += [(p.x, p.y) for p in (seg.point(i / 8) for i in range(1, 9))]
    if len(pts) >= 3:
        rings.append(Polygon(pts).buffer(0))
shape = reduce(lambda a, b: a.symmetric_difference(b), rings)

polys = shape.geoms if isinstance(shape, MultiPolygon) else [shape]
def ring(coords):
    pts = [f"{x:.1f} {y:.1f}".replace(".0 ", " ").replace(".0", "") for x, y in list(coords)[:-1]]
    return "M" + "L".join(pts) + "Z"
d = ""
for p in polys:
    p = orient(p.simplify(0.8), 1.0)
    if not p.is_empty:
        d += ring(p.exterior.coords) + "".join(ring(i.coords) for i in p.interiors)

svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="{d}"/></svg>\n'
out = sys.argv[1] if len(sys.argv) > 1 else "assets/icons/gnu.svg"
open(out, "w").write(svg)
print(f"{out}: {width}x512, {len(svg)} bytes")
