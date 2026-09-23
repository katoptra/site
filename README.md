<p align="center">
  <a href="https://github.com/katoptra">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://katoptra.org/brand/katoptra-mark-dark-224.png">
      <img src="https://katoptra.org/brand/katoptra-mark-224.png" alt="Katoptra" width="112">
    </picture>
  </a>
</p>

<h1 align="center">site</h1>

<p align="center">The landing page for katoptra.org, and the mark every katoptra repository wears.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/katoptra/site" alt="license"></a>
</p>

A Hugo site that lists every mirror with its upstream, cadence, repository, live status
and last sync time, as tiles under a Public / Private switch: the public mirrors, and the
private ones that copy the owner's own accounts. Deployed on Cloudflare Pages on push to
`main`, which is also what publishes the brand files below.

## How it works

1. **Design** is vendored from [ijosh.com](https://github.com/jshvn/ijosh.com) by
   `task theme:update` into `themes/ijosh/`, pinned in `themes/ijosh/THEME_COMMIT`. Nothing
   under `themes/` is edited here; the theme supplies the reset and the shapes, and the
   katoptra palette and face in [The brand](#the-brand) override its tokens.
2. **Data** is one entry per mirror in [`data/mirrors.toml`](data/mirrors.toml). The
   homepage tiles and the ItemList JSON-LD render from it, so adding or retiring a mirror
   is an edit there and nothing else.
3. **Liveness** is [`assets/js/status.js`](assets/js/status.js): at page load it reads each
   mirror's healthchecks.io JSON badge and its sync workflow's runs on GitHub Actions, tints
   each tile's head green or red and fills in the time since its last sync, and on a fetch
   failure leaves the head neutral and the time a dash. Every
   mirror's pipeline pings a healthcheck at the end of each run, which is what the badge
   reports; [katoptra/lib](https://github.com/katoptra/lib#monitoring) has the rest.
4. **Deploy** is `hugo --minify --gc` on push to `main`, by Cloudflare Pages.

## The brand

The mark is two chevrons meeting at a hairline: the upstream on the left in one ink, the
copy on the right in another, and the mirror plane between them. It sits on a rounded tile
that stays dark in both themes, so one file serves a light page and a dark one. The face
is [Gabarito](https://fonts.google.com/specimen/Gabarito), whose rounded terminals match
the tile's corners and the chevrons' caps. The palette is a warm off-white and a
near-black ground, a grey text ramp, and one blue-violet for links.

[`brand/build.py`](brand/build.py) is the source of truth: the geometry, both palettes,
and every file cut from them. Everything it writes is committed and served from
`katoptra.org`, so a README anywhere references the URL and never keeps a copy.

| File | Served at | Use |
|---|---|---|
| `katoptra-mark.svg`, `katoptra-mark-dark.svg` | `/brand/` | The mark on its tile, for a light or a dark page |
| `katoptra-mark-224.png`, `katoptra-mark-dark-224.png` | `/brand/` | The same at 224px, for READMEs at 112 wide |
| `katoptra-mark-1024.png`, `katoptra-mark-dark-1024.png` | `/brand/` | The same at 1024px, for anything larger |
| `katoptra-avatar.svg`, `katoptra-avatar.png` | `/brand/` | The mark on a full-bleed square, for the GitHub org avatar and any surface that rounds its own corners |
| `tokens.css` | `/brand/` | The palette as custom properties, light and dark |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | `/` | The site's icons |
| `images/og.png` | `/images/` | The 1200x630 unfurl card |

Every katoptra README opens with the mark linked to the organization:

```html
<p align="center">
  <a href="https://github.com/katoptra">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://katoptra.org/brand/katoptra-mark-dark-224.png">
      <img src="https://katoptra.org/brand/katoptra-mark-224.png" alt="Katoptra" width="112">
    </picture>
  </a>
</p>
```

To change the mark or a color, edit `MARK`, `LIGHT` or `DARK` in `brand/build.py` and run
`task brand`; `task check` fails if the committed files differ from a rebuild, so the
artwork cannot drift from the script. The font files under `static/fonts/` come from
`task brand:fonts`, which fetches Gabarito from google/fonts at a pinned commit and subsets
it to latin; its license is beside them.

## Want your own?

Fork [katoptra/site](https://github.com/katoptra/site), swap the entries in
`data/mirrors.toml` for your mirrors, point `baseURL` in `hugo.toml` at your domain, and
rewrite the identity-bearing files: `static/llms.txt`, `static/site.webmanifest`,
`static/robots.txt`, `static/.well-known/security.txt`, the footer, and `brand/build.py`
for a mark of your own. It builds to a static site; host it anywhere.

## Operating it

```sh
task               # the menu
task serve         # local dev server with drafts and watch
task check         # brand files match a rebuild; build; fail if any mirrors.toml URL is missing from the page, the social card is absent, or the JSON-LD does not parse
task brand         # rebuild every brand file from brand/build.py
task brand:fonts   # re-fetch and re-subset Gabarito (network)
task theme:update  # re-vendor ijosh.com master and print the diff of each shadowed file
```

Verify a layout change by rendering, in light and dark, at desktop width and about 390px:
the page fits a 1440x900 viewport without internal scroll, and at 390px nothing overflows
sideways.

Pull requests are welcome.

MIT licensed. Built by [Josh Vaughen](https://ijosh.com).
