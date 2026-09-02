# CLAUDE.md

Landing page for **mirrors.ijosh.com** — a Hugo static site indexing the software
mirrors run at ijosh.com (ctan.ijosh.com, tlnet.ijosh.com, ...). Deployed on
Cloudflare Pages on push to `master`; develop on any other branch.

## The one invariant: the design system is not here

The [ijosh.com repo](https://github.com/jshvn/ijosh.com) is the design system,
vendored as a git submodule at `themes/ijosh` and consumed as a Hugo theme. All
tokens (`--bg`, `--text`, `--accent`, ...), fonts, icons, the CSS reset/theme
(`fonts.css`, `split.css`, `style.css`), favicons, and `static/_headers` (CSP)
come from the theme.

- **Do not copy theme files into this repo to change them.** A visual change that
  belongs to the shared design system goes to the ijosh.com repo; a change that is
  mirrors-only goes in `assets/css/mirrors.css` (the last file in the CSS bundle —
  specificity ties resolve here) or a layout override.
- `task theme:update` bumps the submodule to ijosh.com master. Run
  `task visual:check` afterwards; upstream recolors land here by design.
- Clone with `--recurse-submodules` or the theme (and the build) is missing.

## What this repo owns

- `data/mirrors.toml` — the mirror index. **Adding/retiring a mirror is an edit
  here**, nothing else; the homepage and the ItemList JSON-LD render from it.
- `content/_index.md` — title/tagline/pill + intro copy.
- `layouts/_default/baseof.html` — swaps the theme's photo panel for the
  typographic wordmark partial (`layouts/partials/wordmark.html`).
- `layouts/partials/head.html` — mirrors-specific SEO (WebSite + ItemList
  JSON-LD; the Person schema stays on ijosh.com) and the CSS bundle, which is the
  theme's three files **plus** `assets/css/mirrors.css`.
- `layouts/partials/buttons.html` / `footer.html` — the ijosh.com CTA button,
  GitHub icon, credit line.

## ⚠️ Visual changes — verify, don't guess

Same rule as ijosh.com: pixels are locked to golden baselines in
`tests/visual/golden/` (light/dark x desktop/mobile). **Never report a visual
change as done without `task visual:check`.** After an intentional change,
`task visual:bless` and commit the PNGs. The page is designed to fit a
1440x900 viewport without internal scroll — check that when adding mirrors.

## Gotchas

- No third-party runtime assets (theme invariant). That is why mirror entries
  carry no live status badges — badges would need CSP `img-src` changes and
  external requests. Status lives on each mirror's own page.
- The Cloudflare beacon fires only if `params.cloudflareBeaconToken` is set in
  `hugo.toml` (currently unset).
- `mirror.ijosh.com` → `mirrors.ijosh.com` is a zone-level Cloudflare redirect
  rule, configured in the dashboard, not in this repo.
- Cloudflare Pages settings (dashboard, not repo): build `hugo --minify --gc`,
  output `public`, `HUGO_VERSION=0.165.0` (extended).
