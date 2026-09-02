# mirrors

[![license](https://img.shields.io/github/license/jshvn/mirrors)](LICENSE)

The landing page for [mirrors.ijosh.com](https://mirrors.ijosh.com/) — the index of the
software mirrors run at ijosh.com, in the spirit of
[mirrors.mit.edu](https://mirrors.mit.edu/) but wearing the
[ijosh.com](https://ijosh.com) design system. A Hugo site, deployed by Cloudflare Pages
on every push to `master`.

## How it works

1. **Design** — vendored from [ijosh.com](https://github.com/jshvn/ijosh.com) by
   `task theme:update`, pinned in `themes/ijosh/THEME_COMMIT`.
2. **Data** — one entry per mirror in [`data/mirrors.toml`](data/mirrors.toml).
3. **Liveness** — [`assets/js/status.js`](assets/js/status.js) fills the Status and
   Last synced cells at page load; on fetch failure a cell keeps its static fallback.
4. **Deploy** — `hugo --minify --gc` on push to `master`.

## Working on it

```sh
git clone https://github.com/jshvn/mirrors
task            # the menu
task serve      # local dev server — look at light and dark, desktop and mobile
task check      # build, verify every mirror link renders, run the JS self-check
```

## Want your own?

Fork [this repo](https://github.com/jshvn/mirrors), swap the entries in
`data/mirrors.toml` for your mirrors, and point `baseURL` in `hugo.toml` at your
domain. It builds to a static site — host it anywhere.

Pull requests are welcome.

MIT licensed. Built by [Josh Vaughen](https://ijosh.com).
