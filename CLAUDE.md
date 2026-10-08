# CLAUDE.md

This repository is the landing page for **katoptra.org**: a Hugo static site with an index
of the software mirrors at katoptra.org (ctan.katoptra.org, tlnet.katoptra.org and the
others). Cloudflare Pages deploys it at each push to `main`. Do your work on a different
branch.

Writing: ASD-STE100. The Writing section of the
[org CONTRIBUTING](https://github.com/katoptra/.github/blob/main/CONTRIBUTING.md#writing)
gives the rules. Read it before you write.

## The one invariant: the design system is not here

The [ijosh.com repo](https://github.com/jshvn/ijosh.com) is the design system. Its
`layouts/`, `assets/` and `static/` directories are **vendored** into `themes/ijosh/`, and
Hugo uses them as a theme. `themes/ijosh/` is a committed directory. It is not a submodule
and not a Hugo Module.

The CSS reset and the shapes (`fonts.css`, `split.css` and `style.css`) come from the
theme. The identity does **not** come from the theme. The mark, the palette and the face
are katoptra's, and `brand/build.py` makes all of them (refer to
[its section](#brandbuildpy)). In the CSS bundle, `assets/css/tokens.css` overrides the
tokens of the theme (`--bg`, `--text`, `--accent` and the others).

This site keeps these deliberate forks of theme files in `static/`. Each fork shadows the
theme's copy, for the cause that follows it:

- `static/_headers`: it adds the CSP `connect-src` entries for healthchecks.io and
  api.github.com, where the tile status and the age come from.
- `static/site.webmanifest`, `static/llms.txt`, `static/robots.txt` and
  `static/.well-known/security.txt`: the theme's copies contain the bio, the branding, the
  sitemap URL and the security contact of ijosh.com.
- `static/favicon.svg` and `static/favicon.ico`: they show the katoptra mark, not the J of
  ijosh.com.

When the theme changes one of these files, apply that change here manually. After
`task theme:update` vendors the theme again, it prints the diff of each shadowed pair.

- **Do not edit a file in `themes/ijosh/`.** `task theme:update` overwrites all of that
  directory. It vendors the `master` branch of ijosh.com again, and it pins the source
  commit in `themes/ijosh/THEME_COMMIT`. If a visual change is for the design system that
  ijosh.com and this site use, make it in the ijosh.com repo first. Then get it here with
  `task theme:update`.
- Put a change for this site only in `assets/css/mirrors.css` or in a layout override.
  `mirrors.css` is the last file in the CSS bundle. Thus, when two rules have the same
  specificity, the browser uses the rule in `mirrors.css`. The theme sets PT Serif on
  `body.page-template-page-fullsingle-split p`, and a selector with one class has less
  specificity than that selector. Thus, each paragraph rule in `mirrors.css` starts with
  `.page-single`.

## The files

### `data/mirrors.toml`

This file is the mirror index. **To add or remove a mirror, edit this file and no other
file.** The homepage tiles, the ItemList JSON-LD and the names of the public mirrors in the
meta description (the `%s` in `hugo.toml`) come from it.

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
- `usage`, a short description of the mirror. It gets to the page only as the description
  of that mirror in the ItemList JSON-LD.

In `usage`, write the typographic characters, for example — and not --. The markdown
typographer does not change data fields.

### `content/_index.md`

This file holds the one-line `tagline` param, which shows in the masthead. The tagline and
the footer are the only prose on the page. The tagline tells the reader about the service.
The mirror names are in `data/mirrors.toml`, and the tiles put them on the page. Thus this
file and `hugo.toml` contain no mirror name.

### `layouts/_default/baseof.html`

This layout uses one centered column (`.page-single`), not the split layout of the theme.
The masthead is at the top of the column:

- The mark, inline. Its tile and inks get their colors from the tokens.
- The `Katoptra` `<h1>`
- The tagline.

The inline SVG copies the geometry in `brand/build.py`. When you change `MARK` there, apply
the change here manually.

### `layouts/index.html`

This layout has the Public / Private switch and one panel of tiles for each group. Each tile
comes from `layouts/partials/mirror.html`. The switch is two radios that show as one pill
control. `mirrors.css` shows only the panel of the checked group. Thus, the switch has no
JavaScript. The tiles are two across, and one across at a width of 640px or less.

### `layouts/partials/head.html`

This partial has these parts:

- The SEO for the mirrors: the WebSite and ItemList JSON-LD. The Person schema stays on
  ijosh.com.
- The Open Graph and Twitter card tags
- The CSS bundle: the three files of the theme, then `assets/css/tokens.css`, then
  `assets/css/mirrors.css`
- The `assets/js/status.js` module.

### `assets/js/status.js`

At page load, this script puts two values in each tile:

- The status. The script sets the `data-state` of the tile from its healthchecks.io JSON
  badge. That value sets the color of the tile head, and it selects the check badge or the
  cross badge.
- The age. The script gets the last `sync.yml` run with the conclusion `success` from the
  GitHub Actions API, and it sets the age from that run.

Thus, the status and the age are up to date when a person opens the page. If the script
cannot fetch a value, the head stays neutral and the age stays a dash. The self-check is
`node assets/js/status.check.mjs`, and `task check` runs it.

### `static/_headers`

This file has the headers of the theme and the two CSP `connect-src` entries that the tile
status and the age use.

### `static/llms.txt` and `static/site.webmanifest`

Crawlers read `static/llms.txt`, and a browser install reads `static/site.webmanifest`.
The theme's copies of these two files are about ijosh.com.

### `layouts/partials/footer.html`

The footer tells how a pipeline syncs each mirror and how Cloudflare serves the public
mirrors. It also has the open-source note and the MIT and attribution line.

### `static/robots.txt`

This file points crawlers to the `sitemap.xml` of this host. It is a static shadow, not a
`layouts/` template. Hugo copies `static/` after it renders the pages. Thus, the static copy
of the theme overwrites a rendered robots.txt. If the built file names a different sitemap,
`task check` gives an error.

### `static/.well-known/security.txt`

This file is the RFC 9116 contact. It points to the org-wide policy in `katoptra/.github`.
`Expires` is mandatory, and after its date, `task check` gives an error. Then move
`Expires` forward, to a date that is less than one year after the change.

### `sitemap.xml`

Hugo makes this file with its built-in template, from `[sitemap]` in `hugo.toml`. Its only
entry is the one page of this host. The mirrors are on other hosts, and the sitemap
protocol keeps them out of this file. Crawlers find the mirrors through the links on the
page and through the ItemList JSON-LD.

### `brand/build.py`

This script is **the brand**. One geometry (`MARK`) and two palettes (`LIGHT` and `DARK`)
are at its top. The script makes all the other brand files from them:

- The mark SVGs and PNGs, and the full-bleed avatar, in `static/brand/`
- The palette as `static/brand/tokens.css` and as its copy `assets/css/tokens.css`. The two
  files have the same bytes: Hugo bundles from `assets/`, and the site serves from
  `static/`.
- `static/favicon.svg`
- `static/favicon.ico`, at 16, 32 and 48 pixels. The script makes each of these three
  images at its dimension.
- `static/apple-touch-icon.png`
- `static/images/og.png`, the 1200x630 unfurl card: the mark above the name, in Gabarito.

Pillow cannot render SVG. Thus, the script makes the rasters from the same numbers, as
segments with rounded caps at a supersample.

`task brand` makes all the brand files again. `task check` runs `--check`, which makes the
files in memory and gives an error at a difference of one byte. Thus, the artwork always
agrees with the script. The script header pins the dependencies, because a different
resampler can change the bytes and cause an error in that check.

Nine READMEs in the org show the mark from
`https://katoptra.org/brand/katoptra-mark-224.png` (and `-dark-224`). Thus, these two
files are a public interface. If you change their names,
the mark does not show in those nine READMEs.

### `brand/fonts.py`

This script gets Gabarito, the one face of the site, from google/fonts at a pinned commit.
It makes two static instances (400 and 700) and subsets them to latin. Then it writes them
as woff2 to `static/fonts/`, adjacent to the OFL of the font. The script must have network
access.

`build.py` reads the files that this script writes. For the OG card, `build.py`
decompresses the woff2 in memory. The `@font-face` rules are in `mirrors.css`, and
`head.html` preloads the 700.

### `static/brand/`

The site serves this directory at `/brand/*`, with a cache time of one week (set in
`_headers`). The GitHub org avatar is `katoptra-avatar.png`. The owner uploads it manually,
in the Settings of the org. It is the mark on a full-bleed square, because GitHub applies
its radius to avatars. A rounded tile in the avatar shows as a halo.

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

`task check` is the functional gate. First, it gives an error if the brand files are
different from the files that `brand/build.py` makes. Then it builds the site, and it gives
an error if:

- A URL in `data/mirrors.toml` is not on the rendered page
- The Open Graph tags are not there
- `public/images/og.png` is missing or empty.

## Must knows

- Do not use third-party artwork. This is an invariant of the theme. Each icon is a Font
  Awesome Free file, in `assets/icons/` or in the icons of the theme. This includes the
  icon of each upstream (`upstream.icon` in `data/mirrors.toml`). The next two icons are the
  only icons that do not come from Font Awesome.
- `assets/icons/ctan.svg`: Font Awesome has no CTAN icon. `brand/render_ctan_icon.py` makes
  a copy of the favicon of ctan.org, in one color and in the format of Font Awesome. Thus,
  it agrees with the icons adjacent to it. Do not edit the SVG manually. Edit the script.
  Then run `uv run --with shapely brand/render_ctan_icon.py` again.
- `assets/icons/gnu.svg`, on the GNU and Savannah tiles: the Bold GNU Head of gnu.org
  (Aurelio A. Heckert, CC BY-SA 2.0). The repository keeps that file as
  `brand/heckert_gnu.svg`. This command makes a copy of it with the same method:
  `uv run --with svgelements --with shapely brand/render_gnu_icon.py`. The SVG that the
  script makes stays CC BY-SA 2.0.
- The tile does not embed the badge SVG. It fetches the healthchecks.io **JSON** badge.
  Then the page shows a different badge, in the colors of the `--status-*` tokens in
  `mirrors.css`. The tile keeps the URL of the badge SVG, without a change, in
  `data-badge`. The script makes the `.json` URL from it, and `task check` greps for it.
- The age on a tile is a link to the `sync.yml` workflow runs of the repository. It has no
  underline, and it must not have one. The upstream and repository links below it have an
  underline.
- The page loads the Cloudflare beacon only if `hugo.toml` sets
  `params.cloudflareBeaconToken` (unset).
- The Cloudflare Pages configuration is in the dashboard, not in the repository. The build
  command is `hugo --minify --gc`, and the output directory is `public`. The dashboard also
  sets `HUGO_VERSION=0.163.3` (extended).
- The theme's `fonts.css` declares Graduate, Lora, Montserrat and PT Serif. The page uses
  none of them. A browser fetches a face only when it renders text in that face. Thus, the
  browser does not download these faces. Do not set a part of the page in one of them: the
  page has one face.
