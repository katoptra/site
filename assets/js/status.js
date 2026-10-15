/* The parts of each mirror tile that this script sets when the page loads:
   - the health status, from the JSON badge of healthchecks.io
   - the age of the last run of the sync workflow with the conclusion success, from the
     GitHub Actions API
   - the runs bar (one segment for each of the last 10 runs), the next-sync bar, and the
     words under the two bars, from the same page of runs.
   If a fetch gives an error, the tile keeps its fallback: a neutral head, a dash for the
   age and the words, and gray bars. */

// A time span in words: "34 min", "1 hour", "8 hours", "3 days".
export function span(m) {
  if (m < 60) return m + " min";
  const h = Math.round(m / 60);
  if (h < 24) return h + (h === 1 ? " hour" : " hours");
  const d = Math.round(h / 24);
  return d + (d === 1 ? " day" : " days");
}

export function relTime(iso, now = Date.now()) {
  const m = Math.round((now - Date.parse(iso)) / 60000);
  return m < 1 ? "just now" : `${span(m)} ago`;
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

// The segments of the runs bar: the completed runs in the page, oldest first. A run with
// a conclusion other than success (for example failure, cancelled or timed_out) is a
// failed run.
export function segments(d) {
  return (d.workflow_runs ?? [])
    .filter((run) => run.status === "completed")
    .slice(0, 10)
    .reverse()
    .map((run) => (run.conclusion === "success" ? "ok" : "fail"));
}

export function failText(segs) {
  const n = segs.filter((s) => s === "fail").length;
  return n ? `${n} failed` : "none failed";
}

// The percent of the time between two syncs that is gone since the start of the last
// good sync. The next-sync bar fills to this value.
export function fill(iso, minutes, now = Date.now()) {
  const pct = Math.round((now - Date.parse(iso)) / 600 / minutes);
  return Math.min(100, Math.max(0, pct));
}

// The words after "Next sync": from the start of the last good sync, the cadence in
// minutes, a run in progress, and the healthcheck status.
// ponytail: the next sync is the last good start plus the cadence. A mirror with runs at
// irregular times gets an approximate value. Upgrade path: a schedule field in
// data/mirrors.toml.
export function nextText(iso, minutes, running, late, now = Date.now()) {
  if (running) return "in progress";
  const m = Math.round((Date.parse(iso) + minutes * 60000 - now) / 60000);
  if (m > 0) return `in ${span(m)}`;
  return late ? `late by ${span(Math.max(1, -m))}` : "due now";
}

const json = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))));

// The two fetches end in either order. Each one calls this function, and the words show
// when the start of the last good sync is known.
function paintNext(tile) {
  const { started, running, state } = tile.dataset;
  if (!started) return;
  const sync = tile.querySelector(".mirror-sync");
  sync.querySelector(".sync-next").textContent = nextText(started, sync.dataset.minutes, running === "yes", state === "down");
}

if (typeof document !== "undefined") {
  for (const tile of document.querySelectorAll("[data-badge]")) {
    json(tile.dataset.badge.replace(/\.svg$/, ".json"))
      .then((badge) => {
        const state = stateFor(badge);
        tile.dataset.state = state;
        tile.querySelector(".sync-state").textContent = `${tile.querySelector(".mirror-name").textContent} status: ${state === "up" ? "on schedule" : "late"}.`;
        paintNext(tile);
      })
      .catch(() => {});
  }

  for (const link of document.querySelectorAll("[data-runs-api]")) {
    const tile = link.closest(".mirror");
    json(link.dataset.runsApi)
      .then((d) => {
        const segs = segments(d);
        const slots = [...tile.querySelectorAll(".sync-runs i")];
        segs.forEach((s, n) => {
          slots[slots.length - segs.length + n].className = s;
        });
        if (segs.length) {
          const fails = tile.querySelector(".sync-fails");
          tile.querySelector(".sync-count").textContent = `Last ${segs.length} runs`;
          fails.textContent = failText(segs);
          fails.classList.toggle("bad", segs.includes("fail"));
        }

        const run = lastSuccess(d);
        if (!run) return;
        const when = relTime(run.run_started_at);
        const sync = tile.querySelector(".mirror-sync");
        link.querySelector(".mirror-age-value").textContent = shortTime(run.run_started_at);
        link.title = `Synced ${when}, ${run.run_started_at}`;
        link.setAttribute("aria-label", `${link.getAttribute("aria-label")}, last synced ${when}`);
        sync.querySelector(".sync-fill").style.setProperty("--fill", `${fill(run.run_started_at, sync.dataset.minutes)}%`);
        tile.dataset.started = run.run_started_at;
        tile.dataset.running = d.workflow_runs[0].status === "completed" ? "no" : "yes";
        paintNext(tile);
      })
      .catch(() => {});
  }
}
