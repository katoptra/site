/* Live parts of each mirror tile, filled at page load: health status from
   healthchecks.io's JSON badge, and time since the last sync run from the GitHub
   Actions API. On any fetch failure the status pill keeps its "Status" fallback
   and the synced time stays empty, which hides it. */

export function relTime(iso, now = Date.now()) {
  const m = Math.round((now - Date.parse(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  const d = Math.round(h / 24);
  return d + (d === 1 ? " day ago" : " days ago");
}

export function stateFor(badge) {
  return badge.status === "down" ? "down" : "up";
}

const json = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));

if (typeof document !== "undefined") {
  for (const a of document.querySelectorAll("[data-badge]")) {
    json(a.dataset.badge.replace(/\.svg$/, ".json"))
      .then((badge) => {
        const state = stateFor(badge);
        const name = a.closest(".mirror")?.querySelector(".mirror-name")?.textContent.trim();
        a.dataset.state = state;
        a.title = state;
        a.setAttribute("aria-label", name ? `${name} sync: ${state}` : state);
      })
      .catch(() => {});
  }

  for (const el of document.querySelectorAll("[data-runs-api]")) {
    json(el.dataset.runsApi)
      .then((d) => {
        const run = d.workflow_runs && d.workflow_runs[0];
        if (run) {
          el.textContent = "synced " + relTime(run.run_started_at);
          el.title = run.run_started_at;
        }
      })
      .catch(() => {});
  }
}
