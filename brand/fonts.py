# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools[woff]==4.65.0"]
# ///
# Gabarito, the one font of the site, from google/fonts at a pinned commit. The script
# makes two static instances (400 and 700) from the variable TTF and subsets them to
# latin. Then it writes them as woff2 to static/fonts/, adjacent to the license. This
# script must have network access. brand/build.py does not connect to the network: it
# reads the files that this script writes. To run it: uv run brand/fonts.py
import io
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

COMMIT = "a60a77e14f28abd4ef243a1b5dfc48df0cec5205"  # google/fonts, 2026-03-03
BASE = f"https://raw.githubusercontent.com/google/fonts/{COMMIT}/ofl/gabarito/"
LATIN = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
         "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
OUT = Path(__file__).resolve().parent.parent / "static" / "fonts"


def fetch(name: str) -> bytes:
    with urllib.request.urlopen(BASE + name) as r:  # noqa: S310 -- pinned https URL
        return r.read()


variable = fetch("Gabarito%5Bwght%5D.ttf")
(OUT / "gabarito-OFL.txt").write_bytes(fetch("OFL.txt"))
for weight in (400, 700):
    font = instancer.instantiateVariableFont(TTFont(io.BytesIO(variable)), {"wght": weight})
    options = subset.Options(flavor="woff2")
    options.drop_tables += ["DSIG", "meta"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(LATIN))
    subsetter.subset(font)
    out = OUT / f"gabarito-{weight}-latin.woff2"
    font.save(out)
    print(f"{out.relative_to(OUT.parent.parent)}: {out.stat().st_size} bytes")
