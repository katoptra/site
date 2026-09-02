# mirrors

[![license](https://img.shields.io/github/license/jshvn/mirrors)](LICENSE)

The landing page for [mirrors.ijosh.com](https://mirrors.ijosh.com/).

A Hugo site using [ijosh.com](https://github.com/jshvn/ijosh.com) design system. Deployed on Cloudflare Pages.

## How it works

1. **Design** — vendored from [ijosh.com](https://github.com/jshvn/ijosh.com) by
   `task theme:update`, pinned in `themes/ijosh/THEME_COMMIT`.
2. **Data** — one entry per mirror in [`data/mirrors.toml`](data/mirrors.toml).
3. **Liveness** — [`assets/js/status.js`](assets/js/status.js) fills the Status and
   Last synced cells at page load; on fetch failure a cell keeps its static fallback.
4. **Deploy** — `hugo --minify --gc` on push to `master`.

## Working on it

```sh
$ git clone https://github.com/jshvn/mirrors
$ task            # the menu
$ task serve      # local dev server
$ task check      # build and verify
```

## Want your own?

Fork [this repo](https://github.com/jshvn/mirrors), swap the entries in
`data/mirrors.toml` for your mirrors, point `baseURL` in `hugo.toml` at your
domain, and rewrite the identity-bearing files (`static/llms.txt`,
`static/site.webmanifest`, the footer). It builds to a static site — host it
anywhere.

Pull requests are welcome.

MIT licensed. Built by [Josh Vaughen](https://ijosh.com).
