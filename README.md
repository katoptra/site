# site

[![license](https://img.shields.io/github/license/katoptra/site)](LICENSE)

The landing page for [katoptra.org](https://katoptra.org/): a Hugo site that lists every
public mirror with its upstream, cadence, repository, live status and last sync time.
Deployed on Cloudflare Pages on push to `master`.

## How it works

1. **Design** is vendored from [ijosh.com](https://github.com/jshvn/ijosh.com) by
   `task theme:update` into `themes/ijosh/`, pinned in `themes/ijosh/THEME_COMMIT`. Nothing
   under `themes/` is edited here; a change to the design system goes there first.
2. **Data** is one entry per mirror in [`data/mirrors.toml`](data/mirrors.toml). The
   homepage table and the ItemList JSON-LD render from it, so adding or retiring a mirror
   is an edit there and nothing else.
3. **Liveness** is [`assets/js/status.js`](assets/js/status.js): at page load it reads each
   mirror's healthchecks.io JSON badge and its GitHub Actions run list, fills the Status
   and Last synced cells, and on a fetch failure leaves a cell's static fallback. Every
   mirror's pipeline pings a healthcheck at the end of each run, which is what the badge
   reports; [katoptra/lib](https://github.com/katoptra/lib#monitoring) has the rest.
4. **Deploy** is `hugo --minify --gc` on push to `master`, by Cloudflare Pages.

## Want your own?

Fork [katoptra/site](https://github.com/katoptra/site), swap the entries in
`data/mirrors.toml` for your mirrors, point `baseURL` in `hugo.toml` at your domain, and
rewrite the identity-bearing files: `static/llms.txt`, `static/site.webmanifest`, the
favicons under `static/`, and the footer. It builds to a static site; host it anywhere.

## Operating it

```sh
task               # the menu
task serve         # local dev server with drafts and watch
task check         # build; fail if any mirrors.toml URL is missing from the page, the social card is absent, or the JSON-LD does not parse
task theme:update  # re-vendor ijosh.com master and print the diff of each shadowed file
```

Verify a layout change by rendering, in light and dark, at desktop width and about 390px:
the page fits a 1440x900 viewport without internal scroll, and at 390px nothing overflows
sideways.

Pull requests are welcome.

MIT licensed. Built by [Josh Vaughen](https://ijosh.com).
