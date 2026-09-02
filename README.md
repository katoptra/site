# mirrors

The landing page for [mirrors.ijosh.com](https://mirrors.ijosh.com/) — an index
of every actively maintained mirror run at ijosh.com, in the spirit of
[mirrors.mit.edu](https://mirrors.mit.edu/) but wearing the
[ijosh.com](https://ijosh.com) design system.

The mirrors themselves live in their own repos and serve from their own
subdomains; this site only points at them:

| Mirror | Serves | Pipeline |
|---|---|---|
| [ctan.ijosh.com](https://ctan.ijosh.com/) | all of CTAN, hourly | [jshvn/ctan](https://github.com/jshvn/ctan) |
| [tlnet.ijosh.com](https://tlnet.ijosh.com/) | TeX Live tlnet, daily | [jshvn/tlnet](https://github.com/jshvn/tlnet) |

## How it works

A Hugo site with no design of its own. The [ijosh.com repo](https://github.com/jshvn/ijosh.com)
has standard Hugo theme structure, so its `layouts/`, `assets/`, and `static/`
are vendored into `themes/ijosh/` and consumed as a theme: CSS tokens,
self-hosted fonts, icons, and security headers all come from there. This repo
overrides only what a mirrors index needs — the content, the mirror table, a
mirrors-specific `head.html`, and one CSS layer (`assets/css/mirrors.css`) on
top of the theme bundle.

Vendoring is deliberate (no git submodules, no Hugo Modules): `task theme:update`
shallow-clones ijosh.com and copies the three directories in, pinning the source
commit in `themes/ijosh/THEME_COMMIT`. Plain `git clone` works, CI needs nothing
special, and a design change upstream lands here only when explicitly pulled.
(If a Go toolchain ever becomes standard here, Hugo Modules + `hugo mod vendor`
is the drop-in upgrade.)

The mirror list itself is data: one entry per mirror in
[`data/mirrors.toml`](data/mirrors.toml). Adding a mirror is adding an entry.

## Working on it

```sh
git clone https://github.com/jshvn/mirrors
task            # the menu
task serve      # local dev server
task check      # build + verify every mirror link renders
```

## Deploy (Cloudflare Pages, one-time dashboard setup)

- Project connected to this repo, production branch `master`.
- Build command `hugo --minify --gc`, output directory `public`.
- `HUGO_VERSION` env var pinned to the tested extended version (currently `0.165.0`).
- Custom domain `mirrors.ijosh.com`; `mirror.ijosh.com` 301s to it via a zone-level
  Cloudflare redirect rule (not in this repo).

MIT licensed. Maintained by [Josh Vaughen](https://ijosh.com).
