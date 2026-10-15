# CLAUDE.md

This repository is the landing page for **katoptra.org**: a Hugo static site with an index
of the software mirrors at katoptra.org (ctan.katoptra.org, tlnet.katoptra.org and the
others). Cloudflare Pages deploys it at each push to `main`. Do your work on a different
branch.

Writing: obey ASD-STE100 and the rules in the
[Writing section of the org CONTRIBUTING](https://github.com/katoptra/.github/blob/main/CONTRIBUTING.md#writing).
Read that section before you write.

## The theme and the site

`themes/katoptra/` is the shell of a katoptra page. Hugo uses it as a theme. It has these
parts:

- The layouts: `_default/baseof.html` (the masthead and the footer around the `main`
  block), `404.html`, and the `head`, `footer` and `description` partials
- `assets/css/base.css`: the reset, the page column, the masthead, the text links and the
  footer
- `assets/css/tokens.css`: the palette, which `brand/build.py` makes
- `static/`: the font, the mark, the favicons, the unfurl card and `site.webmanifest`.
  `brand/build.py` and `brand/fonts.py` make all of these files except the manifest.

The site root has the mirror index:

- `layouts/index.html` and `layouts/partials/mirror.html`
- `layouts/partials/description.html`, which overrides the partial of the theme
- `assets/css/mirrors.css`, `assets/js/status.js` and the icons in `assets/icons/`
- `data/mirrors.toml` and `content/_index.md`
- `static/`: `_headers`, `llms.txt`, `robots.txt` and `.well-known/security.txt`.

Obey these rules:

- Put a rule for each katoptra page in `base.css`. Put a rule for the mirror index only in
  `mirrors.css`.
- The CSS bundle has `tokens.css`, then `base.css`, then each file that `params.css` of
  `hugo.toml` names. Thus, when two rules have the same specificity, the browser uses the
  rule in `mirrors.css`.
- A page adds tags to the head with a `head` block. `index.html` uses it for the ItemList
  JSON-LD and for `status.js`.
- `base.css` sets the link style on `p a` and on `.link`. Give the `.link` class to the
  text of a link that is not in a paragraph.

## The files

### `data/mirrors.toml`

This file is the mirror index. **To add or remove a mirror, edit this file and
`static/llms.txt`, and no other file.** This file supplies the data for:

- The homepage tiles
- The ItemList JSON-LD
- The names of the public mirrors in the meta description (the `%s` in `hugo.toml`).
  `layouts/partials/description.html` puts them there.

The file has two types of entry:

- `[[mirrors]]` entries are the public mirrors.
- `[[private]]` entries copy the owner's accounts. A private entry has no `url` and no
  `usage`, but it has an `into` (where the copy goes). It shows on the Private tab, and it
  stays out of the JSON-LD.

Each mirror has these fields:

- The display name
- The mirror URL
- The refresh cadence
- The pipeline repository
- The URL of the public healthchecks.io badge
- The upstream name and URL
- `usage`, a short description of the mirror. The page uses it only as the description of
  that mirror in the ItemList JSON-LD.
- `official`, optional: the list of official mirrors at the upstream, when that list has
  this mirror. The tile shows a blue check after the name, and the check is a link to
  that list. Add it only after the upstream shows the mirror on its list.

The cadence must be `hourly`, `twice a day`, `daily` or `nightly`.
`layouts/partials/mirror.html` gives each cadence its minutes for the sync bar. For a
different value, the build stops with an error.

In `usage`, write the typographic characters, for example — and not --. The markdown
typographer does not change data fields.

### `content/_index.md`

This file has the one-line `tagline` param, which shows in the masthead. The tagline and
the footer are the only paragraphs of text on the page. The tagline gives a short
description of the service. The mirror names are in `data/mirrors.toml`, and the tiles put
them on the page. Thus, this file and `hugo.toml` contain no mirror name.

### `themes/katoptra/layouts/_default/baseof.html`

This layout uses one centered column (`.page`). The masthead is at the top of the column:

- The mark, inline. Its tile and inks get their colors from the tokens.
- The `Katoptra` `<h1>`
- The tagline.

The inline SVG copies the geometry in `brand/build.py`. When you change `MARK` there, make
the same change here manually. On a page with no tagline, for example the 404 page, the
name is centered on the mark.

### `layouts/index.html`

This layout has the Public / Private switch and one panel of tiles for each group.
`layouts/partials/mirror.html` makes each tile. The switch is two radios that show as one
pill control. `mirrors.css` shows only the panel of the checked group. Thus, the switch has
no JavaScript. The `head` block of this layout adds the ItemList JSON-LD and `status.js`.
The grid has two columns when each tile can be 380px wide, or else one column
(refer to `mirrors.css`).

### `themes/katoptra/layouts/partials/head.html`

This partial has these parts:

- The SEO: the meta description from the `description` partial, and the WebSite JSON-LD.
  The Person schema stays on ijosh.com.
- The Open Graph and Twitter card tags
- The CSS bundle: `tokens.css`, then `base.css`, then each file in `params.css`.

### `assets/js/status.js`

When the page loads, this script puts these values in each tile:

- The status. The script sets the `data-state` of the tile from its healthchecks.io JSON
  badge. That value sets the color of the tile head and of the last segment of the sync
  bar.
- The age. The script gets the last `sync.yml` run with the conclusion `success` from the
  GitHub Actions API, and it sets the age from that run.
- The sync bar. The script uses the same page of 10 runs. The bar has one segment for each
  completed run, with the oldest run at the left. A run with a conclusion other than
  `success` is a failed segment. The last segment fills in the time between two syncs, from
  the start of the last good run.

The sync bar is a button. Hover, keyboard focus, a click or a tap opens its tooltip. The
tooltip gives the status, the age of the last good sync, the number of failed runs, and how
to read the bar. Escape or a click on a different place closes it.

Thus, the status, the age and the sync bar are up to date when a person opens the page. If
the script cannot fetch a value, the head stays neutral, the age stays a dash, and the
segments stay gray. The self-check is `node assets/js/status.check.mjs`, and `task check`
runs it.

### `static/_headers`

This file has the security headers and the cache rules. These items need a cause:

- Two CSP `connect-src` entries, for healthchecks.io and api.github.com. These hosts supply
  the tile status and the age.
- One CSP `img-src` entry, for brand.ijosh.com. This host supplies the footer mark.
- A `/js/*` rule, the same as the rule for `/css/*`: the fingerprinted `status.js` is
  `immutable` for one year.
- A `/brand/*` rule: the mark and the tokens have a cache time of one week.

### `static/llms.txt` and `themes/katoptra/static/site.webmanifest`

Crawlers read `static/llms.txt`. A browser reads `site.webmanifest` when a person installs
the site.

`static/llms.txt` also has a list of the public mirrors, with the use of each mirror. When
you add or remove a mirror, change this list and `data/mirrors.toml` together.

### `themes/katoptra/layouts/partials/footer.html`

The footer tells how the pipelines build the mirrors and how Cloudflare serves the public
bytes. It also has the attribution line, with the solid J mark. The page loads the mark from
brand.ijosh.com and keeps no copy of it. The rules in
[jshvn/brand](https://github.com/jshvn/brand) tell which form to use at this size.

### `static/robots.txt`

This file points crawlers to the `sitemap.xml` of this host.

### `static/.well-known/security.txt`

This file is the RFC 9116 contact. It points to the org-wide policy in `katoptra/.github`.
`Expires` is necessary, and after its date, `task check` gives an error. Then move
`Expires` forward, to a date that is less than one year after the change.

### `sitemap.xml`

Hugo makes this file with its built-in template, from `[sitemap]` in `hugo.toml`. Its only
entry is the one page of this host. The mirrors are on other hosts, and the sitemap
protocol keeps them out of this file. Crawlers find the mirrors from the links on the page
and from the ItemList JSON-LD.

### `brand/build.py`

This script is **the brand**. One geometry (`MARK`) and two palettes (`LIGHT` and `DARK`)
are at its top. The script makes all the other brand files from them, in
`themes/katoptra/`:

- The mark SVGs and PNGs, and the full-bleed avatar, in `static/brand/`
- The palette as `static/brand/tokens.css` and as its copy `assets/css/tokens.css`. The two
  files have the same bytes: Hugo bundles from `assets/`, and the site serves from
  `static/`.
- `static/favicon.svg`
- `static/favicon.ico`, at 16, 32 and 48 pixels. The script makes each of these three
  images from the geometry, not as a smaller copy of one image.
- `static/apple-touch-icon.png`
- `static/images/og.png`, the 1200x630 unfurl card: the mark above the name, in Gabarito.

Pillow cannot render SVG. Thus, the script makes the rasters from the same numbers, as
segments with rounded caps at a supersample.

`task brand` makes all the brand files again. `task check` runs `--check`, which makes the
files in memory and gives an error at a difference of one byte. Thus, the artwork always
agrees with the script. The script header pins the dependencies, because a different
resampler can change the bytes and cause an error in that check.

The README of each repository in the org shows the mark from
`https://katoptra.org/brand/katoptra-mark-224.png` (and `-dark-224`), but the .github
READMEs do not. Thus, these two files are a public interface. If you change their names,
the mark does not show in those READMEs.

### `brand/fonts.py`

This script gets Gabarito, the one font of the site, from google/fonts at a pinned commit.
It makes two static instances (400 and 700) and subsets them to latin. Then it writes them
as woff2 to `themes/katoptra/static/fonts/`, adjacent to the OFL of the font. The script
must have network access.

`build.py` reads the files that this script writes. For the OG card, `build.py` removes
the compression of the woff2 in memory. The `@font-face` rules are in `base.css`, and
`head.html` preloads the 700.

### `themes/katoptra/static/brand/`

The site serves this directory at `/brand/*`, with a cache time of one week (`_headers`
sets it). The GitHub org avatar is `katoptra-avatar.png`. The owner uploads it manually, in
the Settings of the org. It is the mark on a full-bleed square, because GitHub puts its
corner radius on each avatar. A rounded tile in the avatar shows as a halo.

## Verifying a change

Make sure that a layout or CSS change is correct on the rendered page, not only in the code.
Do these steps for each layout or CSS change, and each time that you add a mirror:

1. Run `task serve`.
2. Look at the page in the light and the dark color scheme, at desktop width and at
   approximately 390px (mobile).
3. Make sure that the full page shows in a 1440x900 viewport without an internal scroll.
4. Make sure that no element overflows horizontally at 390px.
5. Click the Private tab.
6. Do steps 3 and 4 again.
7. For a change in `themes/katoptra/`, open `/404.html`, and do steps 2 to 4 again.

`task check` is the functional test. Run it before you open a pull request.

First, `task check` gives an error if the brand files are different from the files that
`brand/build.py` makes. Then it builds the site, and it gives an error if:

- A URL in `data/mirrors.toml` is not on the rendered page
- The Open Graph tags are not there
- `public/images/og.png` is missing or empty.

## Must knows

- Do not use third-party artwork. Each icon is a Font Awesome Free file in
  `assets/icons/`. This includes the icon of each upstream (`upstream.icon` in `data/mirrors.toml`). The next two icons are the
  only icons that Font Awesome does not supply.
- `assets/icons/ctan.svg`: Font Awesome has no CTAN icon. `brand/render_ctan_icon.py` makes
  a copy of the favicon of ctan.org, in one color and in the format of Font Awesome. Thus,
  it agrees with the icons adjacent to it. Do not edit the SVG manually, because the script
  overwrites a manual change. Edit the script. Then run
  `uv run --with shapely brand/render_ctan_icon.py` again.
- `assets/icons/gnu.svg`, on the GNU and Savannah tiles: the Bold GNU Head of gnu.org
  (Aurelio A. Heckert, CC BY-SA 2.0). The repository keeps that file as
  `brand/heckert_gnu.svg`. This command makes a copy of it with the same method:
  `uv run --with svgelements --with shapely brand/render_gnu_icon.py`. The SVG that the
  script makes stays CC BY-SA 2.0.
- The tile does not embed the badge SVG. It fetches the healthchecks.io **JSON** badge.
  Then the page shows the status in the colors of the `--status-*` tokens in
  `mirrors.css`: the tile head and the last segment of the sync bar. The tile keeps the
  URL of the badge SVG, without a change, in `data-badge`. The script makes the `.json`
  URL from it, and `task check` greps for it.
- The official check is `certificate.svg` with `check.svg` on top of it. Its blue is the
  `--official` token in `mirrors.css`, and it is not the accent. A green check or a check
  in a circle must not show the status, because the official check is the only check on
  the page.
- The age on a tile is a link to the `sync.yml` workflow runs of the repository. It has no
  underline, and it must not have one. The upstream and repository links below it have an
  underline.
- The page loads the Cloudflare beacon only if `hugo.toml` sets
  `params.cloudflareBeaconToken` (unset).
- The Cloudflare Pages configuration is in the dashboard, not in the repository. The build
  command is `hugo --minify --gc`, and the output directory is `public`. The dashboard also
  sets `HUGO_VERSION=0.163.3` (extended).
