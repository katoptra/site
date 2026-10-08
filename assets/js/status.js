/* The parts of each mirror tile that this script sets at page load:
   - the health status, from the JSON badge of healthchecks.io
   - the time since the last sync workflow run with the conclusion success, from the
     GitHub Actions API.
   If a fetch gives an error, the tile keeps its fallback: a neutral head, and a dash for
   the age. */

export function relTime(iso, now = Date.now()) {
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  const d = Math.round(h / 24);
  return d + (d === 1 ? " day ago" : " days ago");
}

// The large age on the tile: the same rounding as relTime, with one letter for the unit.
export function shortTime(iso, now = Date.now()) {
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (m < 1) return "now";
  if (m < 60) return m + "m";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h";
  return Math.round(h / 24) + "d";
}

export function stateFor(badge) {
  return badge.status === "down" ? "down" : "up";
}

// The newest run with the conclusion success, in one page of the unfiltered run list.
// The status=success filter of the API is a search query. For anonymous callers,
// GitHub gets the result from an index that is not up to date. Thus, the same URL can
// give runs with an age of hours or days.
// ponytail: the function looks only in the page that the tile fetches (per_page in
// mirror.html). If no run in that page has the conclusion success, the age shows a
// dash. If that occurs, increase per_page.
export function lastSuccess(d) {
  return d.workflow_runs?.find((run) => run.conclusion === "success");
}

const json = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));

if (typeof document !== "undefined") {
  for (const tile of document.querySelectorAll("[data-badge]")) {
    json(tile.dataset.badge.replace(/\.svg$/, ".json"))
      .then((badge) => {
        const state = stateFor(badge);
        tile.dataset.state = state;
        tile.querySelector(".mirror-badge")?.setAttribute("aria-label", state === "up" ? "Up" : "Down");
      })
      .catch(() => {});
  }

  for (const link of document.querySelectorAll("[data-runs-api]")) {
    json(link.dataset.runsApi)
      .then((d) => {
        const run = lastSuccess(d);
        if (!run) return;
        const when = relTime(run.run_started_at);
        link.querySelector(".mirror-age-value").textContent = shortTime(run.run_started_at);
        link.title = `Synced ${when}, ${run.run_started_at}`;
        link.setAttribute("aria-label", `${link.getAttribute("aria-label")}, last synced ${when}`);
      })
      .catch(() => {});
  }
}
