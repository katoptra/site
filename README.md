<p align="center">
  <a href="https://github.com/katoptra">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://katoptra.org/brand/katoptra-mark-dark-224.png">
      <img src="https://katoptra.org/brand/katoptra-mark-224.png" alt="Katoptra" width="112">
    </picture>
  </a>
</p>

<h1 align="center">site</h1>

<p align="center">The landing page for katoptra.org, and the mark of each katoptra repository.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/katoptra/site" alt="license"></a>
</p>

This repository is a Hugo site. It shows each mirror as a tile, below a Public / Private
switch. The Public group has the public mirrors. The Private group has the private mirrors,
which copy the owner's accounts. Each tile shows these items:

- The upstream
- The cadence
- The repository
- The status
- The time since the last sync.

The page gets the status and the time since the last sync when it loads. Cloudflare Pages
deploys the site at each push to `main`, and this deploy also publishes the files in
[The brand](#the-brand).

## How it works

1. **Design.** `task theme:update` vendors the design from
   [ijosh.com](https://github.com/jshvn/ijosh.com) into `themes/ijosh/`, and it pins the
   design in `themes/ijosh/THEME_COMMIT`. This repository does not edit a file in
   `themes/`. The theme supplies the reset and the shapes. The katoptra palette and face in
   [The brand](#the-brand) override its tokens.
2. **Data.** [`data/mirrors.toml`](data/mirrors.toml) has one entry for each mirror. The
   homepage tiles and the ItemList JSON-LD come from it. Thus, to add or remove a mirror,
   you edit that file and no other file.
3. **Status.** At page load, [`assets/js/status.js`](assets/js/status.js) reads the
   healthchecks.io JSON badge of each mirror and the runs of its sync workflow on GitHub
   Actions. The script makes the head of each tile green or red, and it shows the time
   since the last sync. If the script cannot fetch a source, the head stays neutral and the
   time stays a dash. The pipeline of each mirror pings a healthcheck at the end of each
   run, and the badge shows the result
   ([katoptra/lib](https://github.com/katoptra/lib#monitoring) gives more data).
4. **Deploy.** At each push to `main`, Cloudflare Pages runs `hugo --minify --gc`.

## The brand

The mark is two chevrons that point to a hairline:

- The upstream, on the left, in one ink
- The copy, on the right, in a second ink
- The mirror plane, which is the hairline between them.

The mark is on a rounded tile that stays dark in the light theme and in the dark theme.
Thus, one file is correct for a light page and for a dark page. The face is
[Gabarito](https://fonts.google.com/specimen/Gabarito). Its rounded terminals agree with the
corners of the tile and with the caps of the chevrons. The palette has these colors:

- A warm off-white ground and a near-black ground
- A gray ramp for text
- One blue-violet for links.

[`brand/build.py`](brand/build.py) is the source of truth. It has the geometry and the two
palettes, and it makes each brand file from them. Each file that it writes is in git, and
`katoptra.org` serves it. Thus, a README in a different repository refers to the URL, and it
does not keep a copy.

| File | Served at | Use |
|---|---|---|
| `katoptra-mark.svg`, `katoptra-mark-dark.svg` | `/brand/` | The mark on its tile, for a light page or a dark page |
| `katoptra-mark-224.png`, `katoptra-mark-dark-224.png` | `/brand/` | The same at 224px, for READMEs at a width of 112 |
| `katoptra-mark-1024.png`, `katoptra-mark-dark-1024.png` | `/brand/` | The same at 1024px, for larger images |
| `katoptra-avatar.svg`, `katoptra-avatar.png` | `/brand/` | The mark on a full-bleed square, for the GitHub org avatar and for each surface that applies a corner radius |
| `tokens.css` | `/brand/` | The palette as custom properties, light and dark |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | `/` | The icons of the site |
| `images/og.png` | `/images/` | The 1200x630 unfurl card |

Each katoptra README starts with the mark, as a link to the organization:

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

To change the mark or a color:

1. Edit `MARK`, `LIGHT` or `DARK` in `brand/build.py`.
2. Run `task brand`.

If the committed files are different from the files that the script makes, `task check`
gives an error. Thus, the artwork always agrees with the script.

The font files in `static/fonts/` come from `task brand:fonts`. This task fetches Gabarito
from google/fonts at a pinned commit, and it subsets the font to latin. The license of the
font is in the same directory.

## Want your own?

These files identify this site:

- `static/llms.txt`
- `static/site.webmanifest`
- `static/robots.txt`
- `static/.well-known/security.txt`
- The footer
- `brand/build.py`, which makes the mark.

To make a site for your mirrors:

1. Fork [katoptra/site](https://github.com/katoptra/site).
2. Replace the entries in `data/mirrors.toml` with your mirrors.
3. Set `baseURL` in `hugo.toml` to your domain.
4. Write new versions of the files in that list, with your mark in `brand/build.py`.
5. Put the site on a web host that you select. Hugo builds it to a static site, which all
   web hosts can serve.

## Operating it

```sh
task               # the menu
task serve         # local dev server with drafts and watch
task check         # brand files match a rebuild; build; fail if any mirrors.toml URL is missing from the page, the social card is absent, or the JSON-LD does not parse
task brand         # rebuild every brand file from brand/build.py
task brand:fonts   # re-fetch and re-subset Gabarito (network)
task theme:update  # re-vendor ijosh.com master and print the diff of each shadowed file
```

For a layout change, look at the rendered page in the light and the dark color scheme, at
desktop width and at approximately 390px. Make sure that the full page shows in a 1440x900
viewport without an internal scroll. Make sure that no element overflows horizontally at
390px.

Pull requests are welcome.

MIT licensed. Built by [Josh Vaughen](https://ijosh.com).
