/* The parts of each mirror tile that this script sets when the page loads:
   - the health status, from the JSON badge of healthchecks.io
   - the age of the last run of the sync workflow with the conclusion success, from the
     GitHub Actions API
   - the sync bar: one segment for each of the last 10 runs, and the time since the last
     sync, from the same page of runs.
   If a fetch gives an error, the tile keeps its fallback: a neutral head, a dash for the
   age, and gray segments. */

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

// The segments of the sync bar: the completed runs in the page, oldest first. A run with
// a conclusion other than success (for example failure, cancelled or timed_out) is a
// failed sync.
export function segments(d) {
  return (d.workflow_runs ?? [])
    .filter((run) => run.status === "completed")
    .slice(0, 10)
    .reverse()
    .map((run) => (run.conclusion === "success" ? "ok" : "fail"));
}

// The percent of the time between two syncs that is gone since the start of the last
// sync. The last segment of the sync bar fills to this value.
export function fill(iso, minutes, now = Date.now()) {
  const pct = Math.round((now - Date.parse(iso)) / 600 / minutes);
  return Math.min(100, Math.max(0, pct));
}

export function failLine(segs) {
  if (!segs.length) return "";
  return `${segs.filter((s) => s === "fail").length} of the last ${segs.length} syncs failed.`;
}

const json = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));

if (typeof document !== "undefined") {
  for (const tile of document.querySelectorAll("[data-badge]")) {
    json(tile.dataset.badge.replace(/\.svg$/, ".json"))
      .then((badge) => {
        const state = stateFor(badge);
        const words = state === "up" ? "on schedule" : "late";
        const bar = tile.querySelector(".mirror-sync");
        tile.dataset.state = state;
        tile.querySelector(".sync-state").textContent = `Status: ${words}.`;
        bar.setAttribute("aria-label", `${bar.getAttribute("aria-label")}, ${words}`);
      })
      .catch(() => {});
  }

  for (const link of document.querySelectorAll("[data-runs-api]")) {
    const tile = link.closest(".mirror");
    json(link.dataset.runsApi)
      .then((d) => {
        const segs = segments(d);
        const slots = [...tile.querySelectorAll(".mirror-sync-bar i:not(.sync-now)")];
        segs.forEach((s, n) => {
          slots[slots.length - segs.length + n].className = s;
        });
        tile.querySelector(".sync-fails").textContent = failLine(segs);

        const run = lastSuccess(d);
        if (!run) return;
        const when = relTime(run.run_started_at);
        const bar = tile.querySelector(".mirror-sync-bar");
        link.querySelector(".mirror-age-value").textContent = shortTime(run.run_started_at);
        link.title = `Synced ${when}, ${run.run_started_at}`;
        link.setAttribute("aria-label", `${link.getAttribute("aria-label")}, last synced ${when}`);
        bar.querySelector(".sync-now").style.setProperty("--fill", `${fill(run.run_started_at, bar.dataset.minutes)}%`);
        tile.querySelector(".sync-last").textContent = `The last good sync started ${when}.`;
      })
      .catch(() => {});
  }

  // A click or a tap on a sync bar opens its tooltip, and a click on a different place
  // closes it. Escape closes each tooltip until the pointer or the focus goes to a sync
  // bar again.
  const bars = document.querySelectorAll(".mirror-sync");
  document.addEventListener("click", (e) => {
    const bar = e.target.closest(".mirror-sync");
    for (const b of bars) if (b !== bar) b.classList.remove("open");
    bar?.classList.remove("shut");
    bar?.classList.toggle("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const b of bars) {
      b.classList.remove("open");
      b.classList.add("shut");
    }
  });
  for (const b of bars) {
    b.addEventListener("pointerenter", () => b.classList.remove("shut"));
    b.addEventListener("focus", () => b.classList.remove("shut"));
  }
}
