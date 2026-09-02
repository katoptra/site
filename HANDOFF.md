# Handoff

Context from the session that built this repo (2026-09-01), for whoever picks it
up next — human or agent. The README and CLAUDE.md describe the system; this
file carries the decisions and what remains.

## What this is

The landing page for mirrors.ijosh.com: an index of the software mirrors run at
ijosh.com, in the spirit of mirrors.mit.edu, styled as a sibling of the personal
site. The mirrors themselves (ctan, tlnet) live in their own repos with their
own sync machinery; this site only points at them.

## Decisions made, and why

**Separate repo, not part of ijosh.com.** A four-voice council reviewed this
and was unanimous. The deciding facts: one Cloudflare Pages project serves
identical content on every attached domain, so co-locating buys zero deployment
reuse; the ijosh.com repo is deliberately single-page (disableKinds, Person
JSON-LD, golden pixel baselines) and resists a second page; and the ecosystem
pattern was already one repo per mirror concern. A second Pages project against
the same repo was rejected because its build config would live only in the
Cloudflare dashboard — unversioned and unrecoverable from git.

**Design system vendored, not submoduled, not Hugo Modules.** The ijosh.com
repo has standard Hugo theme structure, so its `layouts/`, `assets/`, and
`static/` are copied wholesale into `themes/ijosh/` by `task theme:update`
(shallow clone + copy, source commit pinned in `themes/ijosh/THEME_COMMIT`).
Submodules were tried first and removed at the owner's request (clone and
update friction). Hugo Modules is the textbook mechanism but every maintenance
operation needs a Go toolchain, which is not installed on the dev machine; if Go
ever becomes standard, `hugo mod get` + `hugo mod vendor` is the drop-in
upgrade. Never edit under `themes/ijosh/` — changes belong upstream in
ijosh.com, then get re-vendored.

**Table, not cards.** The first draft rendered each mirror as a card block with
headings and an endpoint URL; the owner asked for a mirrors.mit.edu-style table
instead: mirror link, refresh cadence, repo link, healthcheck link, upstream
link. Columns come from `data/mirrors.toml`. The Status column links to each
mirror's public healthchecks.io badge URL rather than embedding the badge —
embedding would break the theme's no-third-party-assets invariant and require
CSP `img-src` changes in the shared `_headers`.

**No visual-regression harness.** A port of ijosh.com's golden-baseline harness
(Playwright + Pillow) was built, then removed at the owner's request. Verification
is now: render and look (`task serve`, both themes, desktop and ~390px), plus
`task check`, which builds and fails if any URL in `data/mirrors.toml` is
missing from the rendered page.

**Design notes.** The left panel is a typographic wordmark — "MIRRORS" in
Graduate with a faded CSS reflection (scaleY(-1) + mask), doubling as the page
`<h1>`. All colors run through the ijosh tokens; the only new tokens are
`--panel` / `--panel-fg` / `--panel-muted` in `assets/css/mirrors.css`. The
content column is widened to 720px (the theme's 640px can't seat five columns),
and at ≤800px the panel becomes a 32vh band and the content drops its forced
full-viewport height. Verified in all four theme x viewport combos: the page
fits 1440x900 without internal scroll, and on mobile the table scrolls inside
`.mirror-table-wrap` while the document stays at viewport width.

## Current state

Three commits, clean tree, `task check` passing, `task` prints the menu.
Local only — nothing is published yet.

## Remaining steps (owner, in order)

1. Create and push the GitHub repo (agent was permission-blocked from this):

   ```sh
   cd ~/Git/personal/mirrors
   gh repo create jshvn/mirrors --public \
     --description "Landing page for mirrors.ijosh.com — the index of software mirrors run at ijosh.com" \
     --homepage "https://mirrors.ijosh.com/" --source . --push
   ```

2. Cloudflare Pages (dashboard): project on `jshvn/mirrors`, production branch
   `master`, build `hugo --minify --gc`, output `public`,
   `HUGO_VERSION=0.165.0` (extended — the version the site was built and
   verified with). Attach custom domain `mirrors.ijosh.com`.
3. Zone-level Cloudflare redirect rule: `mirror.ijosh.com` → 301 →
   `https://mirrors.ijosh.com/`.
4. Optional: set `params.cloudflareBeaconToken` in `hugo.toml` to enable
   analytics; the guard is already in `head.html`.

## Adding the next mirror

One entry in `data/mirrors.toml` (name, url, cadence, repo, healthcheck badge
URL, upstream). Then `task check`, and eyeball that the page still fits
1440x900 without internal scroll.
