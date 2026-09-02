# CLAUDE.md

Landing page for **mirrors.ijosh.com** — a Hugo static site indexing the software
mirrors run at ijosh.com (ctan.ijosh.com, tlnet.ijosh.com, ...). Deployed on
Cloudflare Pages on push to `master`; develop on any other branch.

## The one invariant: the design system is not here

The [ijosh.com repo](https://github.com/jshvn/ijosh.com) is the design system.
Its `layouts/`, `assets/`, and `static/` are **vendored** into `themes/ijosh/`
(a plain committed directory — not a submodule, not a Hugo Module) and consumed
as a Hugo theme. All tokens (`--bg`, `--text`, `--accent`, ...), fonts, icons,
the CSS reset/theme (`fonts.css`, `split.css`, `style.css`), favicons, and
`static/_headers` (CSP) come from the theme.

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
- `layouts/_default/baseof.html` — swaps the theme's photo panel for the
  typographic wordmark partial (`layouts/partials/wordmark.html`), which is the
  page's `<h1>`.
- `layouts/index.html` — the mirror table.
- `layouts/partials/head.html` — mirrors-specific SEO (WebSite + ItemList
  JSON-LD; the Person schema stays on ijosh.com) and the CSS bundle, which is the
  theme's three files **plus** `assets/css/mirrors.css`.
- `layouts/partials/footer.html` — open-source note, attribution, contact links.

## Verify visual changes by rendering

Verify layout/CSS changes by rendering, not by reasoning: `task serve` and look,
in light and dark, desktop and ~390px mobile. The page is designed to fit a
1440x900 viewport without internal scroll, and the mirror table scrolls inside
`.mirror-table-wrap` without widening the page — check both when adding mirrors.
`task check` is the functional gate: it builds and fails if any URL in
`data/mirrors.toml` is missing from the rendered page.

## Gotchas

- No third-party runtime assets (theme invariant). That is why the Status column
  links to the healthchecks.io badge instead of embedding it — an `<img>` would
  need CSP `img-src` changes and an external request.
- The Cloudflare beacon fires only if `params.cloudflareBeaconToken` is set in
  `hugo.toml` (currently unset).
- `mirror.ijosh.com` → `mirrors.ijosh.com` is a zone-level Cloudflare redirect
  rule, configured in the dashboard, not in this repo.
- Cloudflare Pages settings (dashboard, not repo): build `hugo --minify --gc`,
  output `public`, `HUGO_VERSION=0.165.0` (extended).
