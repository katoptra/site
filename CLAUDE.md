# CLAUDE.md

Landing page for **mirrors.ijosh.com** — a Hugo static site indexing the software
mirrors run at ijosh.com (ctan.ijosh.com, tlnet.ijosh.com, ...). Deployed on
Cloudflare Pages on push to `master`; develop on any other branch.

## The one invariant: the design system is not here

The [ijosh.com repo](https://github.com/jshvn/ijosh.com) is the design system.
Its `layouts/`, `assets/`, and `static/` are **vendored** into `themes/ijosh/`
(a plain committed directory — not a submodule, not a Hugo Module) and consumed
as a Hugo theme. All tokens (`--bg`, `--text`, `--accent`, ...), fonts, icons,
and the CSS reset/theme (`fonts.css`, `split.css`, `style.css`) come from the
theme. Deliberate forks: `static/_headers`, `static/llms.txt`,
`static/site.webmanifest`, `static/favicon.svg` and `static/favicon.ico` here
shadow the theme's copies — `_headers` because the live status cells need extra
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
  in the CSS bundle — specificity ties resolve here) or a layout override.

## What this repo owns

- `data/mirrors.toml` — the mirror index. **Adding/retiring a mirror is an edit
  here**, nothing else; the homepage table and the ItemList JSON-LD render from it.
  Per mirror: display name, mirror URL, refresh cadence, pipeline repo, public
  healthchecks.io badge URL, upstream name + URL.
- `content/_index.md` — the intro paragraph.
- `layouts/_default/baseof.html` — replaces the theme's split layout with a
  single centered column (`.page-single`) headed by the `Mirrors` masthead
  `<h1>`.
- `layouts/index.html` — the mirror table.
- `layouts/partials/head.html` — mirrors-specific SEO (WebSite + ItemList
  JSON-LD; the Person schema stays on ijosh.com), the CSS bundle (the theme's
  three files **plus** `assets/css/mirrors.css`), and the `assets/js/status.js`
  module.
- `assets/js/status.js` — fills the Status and Last synced cells at page load
  from healthchecks.io's JSON badges and the GitHub Actions API, so both are
  live at the moment the visitor opens the page. On fetch failure a cell keeps
  its static fallback. Self-check: `node assets/js/status.check.mjs` (part of
  `task check`).
- `static/_headers` — the theme's headers plus the two CSP `connect-src`
  entries the live cells need.
- `static/llms.txt` and `static/site.webmanifest` — this site's crawler and
  install surface (the theme's copies describe ijosh.com).
- `layouts/partials/footer.html` — open-source note and the MIT/attribution line.
- `layouts/robots.txt` — templated (`enableRobotsTXT`); the sitemap URL derives
  from `baseURL`, and the rendered file wins over the theme's static copy.

## Verify visual changes by rendering

Verify layout/CSS changes by rendering, not by reasoning: `task serve` and look,
in light and dark, desktop and ~390px mobile. The page is designed to fit a
1440x900 viewport without internal scroll, and the mirror table scrolls inside
`.mirror-table-wrap` without widening the page — check both when adding mirrors.
`task check` is the functional gate: it builds and fails if any URL in
`data/mirrors.toml` is missing from the rendered page.

## Gotchas

- No third-party artwork (theme invariant). The Status cell fetches the
  healthchecks.io **JSON** badge and shows a Font Awesome icon (green check
  when up / red x when down — this repo's `assets/icons/`, colored by the
  `--status-*` tokens in `mirrors.css`) rather than embedding the badge SVG;
  the icon links to the repo's Actions page, and the badge SVG URL rides
  verbatim in `data-badge` (the script derives `.json` from it), which is what
  `task check` greps for.
- The Cloudflare beacon fires only if `params.cloudflareBeaconToken` is set in
  `hugo.toml` (currently unset).
- `mirror.ijosh.com` → `mirrors.ijosh.com` is a zone-level Cloudflare redirect
  rule, configured in the dashboard, not in this repo.
- Cloudflare Pages settings (dashboard, not repo): build `hugo --minify --gc`,
  output `public`, `HUGO_VERSION=0.165.0` (extended).
