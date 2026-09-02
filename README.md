# mirrors

[![license](https://img.shields.io/github/license/jshvn/mirrors)](https://github.com/jshvn/mirrors/blob/master/LICENSE)
[![ctan](https://healthchecks.io/b/2/f4ad55cc-4b2d-4cce-b133-aba5381d9e71.svg)](https://github.com/jshvn/ctan/actions)
[![tlnet](https://healthchecks.io/b/2/f34567b9-d513-41a5-93d8-56fb69d25257.svg)](https://github.com/jshvn/tlnet/actions)

The landing page for [mirrors.ijosh.com](https://mirrors.ijosh.com/) — the index of the
software mirrors run at ijosh.com, in the spirit of
[mirrors.mit.edu](https://mirrors.mit.edu/) but wearing the
[ijosh.com](https://ijosh.com) design system. A Hugo site, deployed by Cloudflare Pages
on every push to `master`.

## The mirrors

| Mirror | Serves | Pipeline |
|---|---|---|
| [ctan.ijosh.com](https://ctan.ijosh.com/) | all of CTAN, hourly | [jshvn/ctan](https://github.com/jshvn/ctan) |
| [tlnet.ijosh.com](https://tlnet.ijosh.com/) | TeX Live tlnet, daily | [jshvn/tlnet](https://github.com/jshvn/tlnet) |

Each mirror lives in its own repo with its own sync machinery; this site only points at
them. The page is live at the moment you open it: healthchecks.io's JSON badge colors
each status icon, and the GitHub Actions API dates each last successful sync — both
fetched in the browser at page load.

## How it works

The site owns as little as possible. Every step is a task in
[`Taskfile.yml`](Taskfile.yml):

1. **Design** — the [ijosh.com repo](https://github.com/jshvn/ijosh.com) has standard
   Hugo theme structure, so `task theme:update` shallow-clones it and vendors its
   `layouts/`, `assets/`, and `static/` into `themes/ijosh/`, pinning the source commit
   in `themes/ijosh/THEME_COMMIT`. Tokens, fonts, icons, and headers all come from
   there; this repo adds one CSS layer and a handful of layout overrides. No submodules,
   no Hugo Modules — plain `git clone` works and CI needs nothing special.
2. **Data** — the mirror index is [`data/mirrors.toml`](data/mirrors.toml), one entry
   per mirror. The homepage table and the ItemList JSON-LD render from it; adding a
   mirror is adding an entry.
3. **Liveness** — [`assets/js/status.js`](assets/js/status.js) fills the Status and
   Last synced cells at page load. On any fetch failure a cell keeps its static
   fallback, so the page degrades to plain links.
4. **Deploy** — Cloudflare Pages runs `hugo --minify --gc` on push to `master`. There
   is no other pipeline.

**Is it healthy?** The badges above are the same healthchecks.io checks the page reads.

## Working on it

```sh
git clone https://github.com/jshvn/mirrors
task            # the menu
task serve      # local dev server — look at light and dark, desktop and mobile
task check      # build, verify every mirror link renders, run the JS self-check
```

## Want your own?

1. Fork [this repo](https://github.com/jshvn/mirrors) and swap the entries in
   `data/mirrors.toml` for your mirrors.
2. Point `baseURL` in `hugo.toml` at your domain, and reskin or re-vendor
   `themes/ijosh/` to taste.
3. Create a Cloudflare Pages project on the fork with the settings below and attach
   your custom domain. That is the whole requirement.

| Setting | Value |
| --- | --- |
| Production branch | `master` |
| Build command | `hugo --minify --gc` |
| Build output directory | `public` |
| `HUGO_VERSION` | `0.165.0` (extended) |

One zone-level detail lives outside the repo: `mirror.ijosh.com` 301s to
`mirrors.ijosh.com` via a Cloudflare redirect rule in the dashboard.

Pull requests are welcome.

MIT licensed. Built by [Josh Vaughen](https://ijosh.com).
