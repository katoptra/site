# mirrors.ijosh.com

The landing page for the software mirrors run at ijosh.com — an index of every
actively maintained mirror, in the style of [mirrors.mit.edu](https://mirrors.mit.edu/)
but wearing the [ijosh.com](https://ijosh.com) design system.

The mirrors themselves live in their own repos and serve from their own
subdomains; this site only points at them:

| Mirror | Serves | Pipeline |
|---|---|---|
| [ctan.ijosh.com](https://ctan.ijosh.com/) | all of CTAN, hourly | [jshvn/ctan](https://github.com/jshvn/ctan) |
| [tlnet.ijosh.com](https://tlnet.ijosh.com/) | TeX Live tlnet, daily | [jshvn/tlnet](https://github.com/jshvn/tlnet) |

## How it works

A Hugo site with no design of its own. The [ijosh.com repo](https://github.com/jshvn/ijosh.com)
is vendored as a git submodule at `themes/ijosh` and consumed as a Hugo theme:
layouts, CSS tokens, self-hosted fonts, icons, and security headers all come
from there. This repo overrides only what a mirrors index needs — the content,
the mirror list, a mirrors-specific `head.html`, and one CSS layer
(`assets/css/mirrors.css`) on top of the theme bundle.

The mirror list itself is data: one entry per mirror in
[`data/mirrors.toml`](data/mirrors.toml). Adding a mirror is adding an entry.

## Working on it

```sh
git clone --recurse-submodules https://github.com/jshvn/mirrors.ijosh.com
task            # the menu
task serve      # local dev server
task visual:check
```

Rendered pixels are locked to golden baselines (light + dark, desktop + mobile)
in `tests/visual/golden/`; `task visual:check` fails on drift. To pick up a
design change from ijosh.com, `task theme:update`, then re-bless.

## Deploy (Cloudflare Pages, one-time dashboard setup)

- Project connected to this repo, production branch `master`; Pages clones the
  public submodule automatically.
- Build command `hugo --minify --gc`, output directory `public`.
- `HUGO_VERSION` env var pinned to the tested extended version (currently `0.165.0`).
- Custom domain `mirrors.ijosh.com`; `mirror.ijosh.com` 301s to it via a zone-level
  Cloudflare redirect rule (not in this repo).

MIT licensed. Maintained by [Josh Vaughen](https://ijosh.com).
