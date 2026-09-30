// Self-check for status.js; run with: node assets/js/status.check.mjs
import { strict as assert } from "node:assert";
import { lastSuccess, relTime, shortTime, stateFor } from "./status.js";

assert.equal(stateFor({ status: "up" }), "up");
assert.equal(stateFor({ status: "up", grace: 1 }), "up"); // in-grace (late) deliberately reads as up
assert.equal(stateFor({ status: "late" }), "up"); // non-"down" statuses fail toward up, never a blank state
assert.equal(stateFor({ status: "down" }), "down");

const now = Date.parse("2026-09-01T12:00:00Z");
assert.equal(relTime("2026-09-01T11:59:40Z", now), "just now");
assert.equal(relTime("2026-09-01T11:26:00Z", now), "34 min ago");
assert.equal(relTime("2026-09-01T10:58:00Z", now), "1 hour ago");
assert.equal(relTime("2026-09-01T04:00:00Z", now), "8 hours ago");
assert.equal(relTime("2026-08-29T12:00:00Z", now), "3 days ago");
assert.equal(shortTime("2026-09-01T11:59:40Z", now), "now");
assert.equal(shortTime("2026-09-01T11:26:00Z", now), "34m");
assert.equal(shortTime("2026-09-01T10:58:00Z", now), "1h"); // same rounding as relTime
assert.equal(shortTime("2026-09-01T04:00:00Z", now), "8h");
assert.equal(shortTime("2026-08-29T12:00:00Z", now), "3d");

const runs = [
  { status: "in_progress", conclusion: null, run_started_at: "c" },
  { status: "completed", conclusion: "failure", run_started_at: "b" },
  { status: "completed", conclusion: "success", run_started_at: "a" },
  { status: "completed", conclusion: "success", run_started_at: "z" },
];
assert.equal(lastSuccess({ workflow_runs: runs }).run_started_at, "a"); // newest success, past running and failed runs
assert.equal(lastSuccess({ workflow_runs: runs.slice(0, 2) }), undefined); // none in the page: the age stays a dash
assert.equal(lastSuccess({}), undefined);
console.log("status.check: ok");
