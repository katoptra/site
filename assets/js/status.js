/* Live parts of each mirror tile, filled at page load: health status from
   healthchecks.io's JSON badge, and time since the sync workflow's last
   successful run from the GitHub Actions API. On any fetch failure the tile keeps
   its fallback: a neutral head, and a dash for the age. */

export function relTime(iso, now = Date.now()) {
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  const d = Math.round(h / 24);
  return d + (d === 1 ? " day ago" : " days ago");
}

// The tile's large age: relTime's rounding, one letter for the unit.
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
        const run = d.workflow_runs && d.workflow_runs[0];
        if (!run) return;
        const when = relTime(run.run_started_at);
        link.querySelector(".mirror-age-value").textContent = shortTime(run.run_started_at);
        link.title = `Synced ${when}, ${run.run_started_at}`;
        link.setAttribute("aria-label", `${link.getAttribute("aria-label")}, last synced ${when}`);
      })
      .catch(() => {});
  }
}
