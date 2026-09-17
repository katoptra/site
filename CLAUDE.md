# CLAUDE.md

Landing page for **katoptra.org** — a Hugo static site indexing the software
mirrors run at katoptra.org (ctan.katoptra.org, tlnet.katoptra.org, ...). Deployed on
Cloudflare Pages on push to `master`; develop on any other branch.

## The one invariant: the design system is not here

The [ijosh.com repo](https://github.com/jshvn/ijosh.com) is the design system.
Its `layouts/`, `assets/`, and `static/` are **vendored** into `themes/ijosh/`
(a plain committed directory — not a submodule, not a Hugo Module) and consumed
as a Hugo theme. All tokens (`--bg`, `--text`, `--accent`, ...), fonts, icons,
and the CSS reset/theme (`fonts.css`, `split.css`, `style.css`) come from the
theme. Deliberate forks: `static/_headers`, `static/llms.txt`,
`static/site.webmanifest`, `static/favicon.svg` and `static/favicon.ico` here
shadow the theme's copies — `_headers` because the live status pills need extra
CSP `connect-src` entries (healthchecks.io, api.github.com), the manifest and
llms.txt because the theme's versions carry ijosh.com's bio and branding, the
favicons because this site is katoptra's K drawn in the theme's own stroke
style, not ijosh.com's J — and `layouts/robots.txt` replaces the theme's static
robots.txt with a template. A theme change to any of these must be re-applied
locally; `task theme:update` prints the diff of each shadowed pair after
re-vendoring.

- **Never edit anything under `themes/ijosh/`** — it is overwritten wholesale by
  `task theme:update`, which re-vendors ijosh.com master and pins the source
  commit in `themes/ijosh/THEME_COMMIT`. A visual change that belongs to the
  shared design system goes to the ijosh.com repo first, then gets pulled here.
- A change that is mirrors-only goes in `assets/css/mirrors.css` (the last file
  in the CSS bundle — specificity ties resolve here) or a layout override. The
  theme sets PT Serif on `body.page-template-page-fullsingle-split p`, which a
  single class loses to, so paragraph rules there are scoped under `.page-single`.

## What this repo owns

- `data/mirrors.toml` — the mirror index. **Adding/retiring a mirror is an edit
  here**, nothing else; the homepage tiles and the ItemList JSON-LD render from it.
  `[[mirrors]]` are the public ones; `[[private]]` copy the owner's own accounts,
  have no `url` or `usage` but an `into` (where the copy lands), render under the
  Private tab, and stay out of the JSON-LD.
  Per mirror: display name, mirror URL, refresh cadence, pipeline repo, public
  healthchecks.io badge URL, upstream name + URL, and one sentence of `usage`,
  which reaches the page only as that mirror's description in the ItemList
  JSON-LD. Write real punctuation (—) in `usage`: data fields bypass the
  markdown typographer.
- `content/_index.md` — the one-line `tagline` param rendered in the masthead,
  the page's only prose outside the footer. It carries the service framing;
  the mirror names live in `data/mirrors.toml` and reach the page through the
  tiles, so nothing here or in `hugo.toml` names a mirror.
- `layouts/_default/baseof.html` — replaces the theme's split layout with a
  single centered column (`.page-single`) headed by the masthead: the favicon's
  K inlined (so its tile follows the theme), the `Katoptra` `<h1>`, and the
  tagline.
- `layouts/index.html` — the Public / Private switch and one panel of tiles per
  group, each tile from `layouts/partials/mirror.html`. The switch is two radios
  drawn as a pill control; `mirrors.css` hides the unchecked group's panel, so
  it needs no JavaScript. Tiles sit two across, one across under 640px.
- `layouts/partials/head.html` — mirrors-specific SEO (WebSite + ItemList
  JSON-LD; the Person schema stays on ijosh.com), the Open Graph and Twitter
  card tags, the CSS bundle (the theme's three files **plus**
  `assets/css/mirrors.css`), and the `assets/js/status.js` module.
- `assets/js/status.js` — fills each tile's status pill and synced time at page load
  from healthchecks.io's JSON badges and the GitHub Actions API, so both are
  live at the moment the visitor opens the page. On fetch failure the pill
  keeps its "Status" fallback and the synced time stays empty and hidden.
  Self-check: `node assets/js/status.check.mjs` (part of `task check`).
- `static/_headers` — the theme's headers plus the two CSP `connect-src`
  entries the live status pills and synced times need.
- `static/llms.txt` and `static/site.webmanifest` — this site's crawler and
  install surface (the theme's copies describe ijosh.com).
- `layouts/partials/footer.html` — how the mirrors are synced and served, the
  open-source note, and the MIT/attribution line.
- `layouts/robots.txt` — templated (`enableRobotsTXT`); the sitemap URL derives
  from `baseURL`, and the rendered file wins over the theme's static copy.
- `brand/github-avatar.png` — the GitHub org avatar: the favicon K on a
  full-bleed square, because GitHub clips avatars to its own radius and the
  favicon's rounded corners would show as a halo inside it. Not served by Hugo.
  Regenerate with `uv run --with pillow brand/render_github_avatar.py` whenever
  `static/favicon.svg` changes.
- `brand/render_og_image.py` → `static/images/og.png` — the 1200x630 unfurl card,
  the same favicon geometry over a wordmark set in the theme's own Graduate and
  Montserrat (Pillow needs sfnt, so the script strips the woff2 compression in
  memory). Served at `/images/og.png`, which picks up the `/images/*` cache rule
  in `static/_headers`. Regenerate with
  `uv run --with pillow --with 'fonttools[woff]' brand/render_og_image.py --wordmark`
  whenever `static/favicon.svg` changes; `--wordmark` is the variant that ships,
  and dropping it renders the mark alone.

## Verify visual changes by rendering

Verify layout/CSS changes by rendering, not by reasoning: `task serve` and look,
in light and dark, desktop and ~390px mobile. The page is designed to fit a
1440x900 viewport without internal scroll, and at 390px nothing may overflow
horizontally — check both when adding a mirror, and click the Private tab.
`task check` is the functional gate: it builds and fails if any URL in
`data/mirrors.toml` is missing from the rendered page, if the Open Graph tags
are absent, or if `public/images/og.png` is missing or empty.

## Gotchas

- No third-party artwork (theme invariant). The status pill fetches the
  healthchecks.io **JSON** badge and reads Up or Down (colored by the
  `--status-*` tokens in `mirrors.css`) rather than embedding the badge SVG;
  the pill links to the repo's Actions page, and the badge SVG URL rides
  verbatim in `data-badge` (the script derives `.json` from it), which is what
  `task check` greps for.
- The Cloudflare beacon fires only if `params.cloudflareBeaconToken` is set in
  `hugo.toml` (currently unset).
- Cloudflare Pages settings (dashboard, not repo): build `hugo --minify --gc`,
  output `public`, `HUGO_VERSION=0.163.3` (extended).
