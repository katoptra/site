// The self-check for status.js. To run it: node assets/js/status.check.mjs
import { strict as assert } from "node:assert";
import { failLine, fill, lastSuccess, relTime, segments, shortTime, stateFor } from "./status.js";

assert.equal(stateFor({ status: "up" }), "up");
assert.equal(stateFor({ status: "up", grace: 1 }), "up"); // in grace (late) shows as up, and this is correct
assert.equal(stateFor({ status: "late" }), "up"); // a status other than "down" shows as up, not as an empty state
assert.equal(stateFor({ status: "down" }), "down");

const now = Date.parse("2026-09-01T12:00:00Z");
assert.equal(relTime("2026-09-01T11:59:40Z", now), "just now");
assert.equal(relTime("2026-09-01T11:26:00Z", now), "34 min ago");
assert.equal(relTime("2026-09-01T10:58:00Z", now), "1 hour ago");
assert.equal(relTime("2026-09-01T04:00:00Z", now), "8 hours ago");
assert.equal(relTime("2026-08-29T12:00:00Z", now), "3 days ago");
assert.equal(shortTime("2026-09-01T11:59:40Z", now), "now");
assert.equal(shortTime("2026-09-01T11:26:00Z", now), "34m");
assert.equal(shortTime("2026-09-01T10:58:00Z", now), "1h"); // the same rounding as relTime
assert.equal(shortTime("2026-09-01T04:00:00Z", now), "8h");
assert.equal(shortTime("2026-08-29T12:00:00Z", now), "3d");

const runs = [
  { status: "in_progress", conclusion: null, run_started_at: "c" },
  { status: "completed", conclusion: "failure", run_started_at: "b" },
  { status: "completed", conclusion: "success", run_started_at: "a" },
  { status: "completed", conclusion: "success", run_started_at: "z" },
];
assert.equal(lastSuccess({ workflow_runs: runs }).run_started_at, "a"); // the newest success, not the in-progress or failed run
assert.equal(lastSuccess({ workflow_runs: runs.slice(0, 2) }), undefined); // no success in the page: the age stays a dash
assert.equal(lastSuccess({}), undefined);

assert.deepEqual(segments({ workflow_runs: runs }), ["ok", "ok", "fail"]); // oldest first, without the in-progress run
const cancelled = { status: "completed", conclusion: "cancelled" };
const eleven = [cancelled, ...Array(10).fill({ status: "completed", conclusion: "success" })];
assert.deepEqual(segments({ workflow_runs: eleven }), [...Array(9).fill("ok"), "fail"]); // the newest 10 only, and a cancelled run fails
assert.deepEqual(segments({}), []);

assert.equal(fill("2026-09-01T11:42:00Z", 60, now), 30); // 18 of 60 minutes
assert.equal(fill("2026-09-01T00:00:00Z", 720, now), 100); // 12 of 12 hours
assert.equal(fill("2026-08-30T12:00:00Z", 60, now), 100); // late: the segment stays full
assert.equal(fill("2026-09-01T12:05:00Z", 60, now), 0); // a clock in the future does not give a negative value

assert.equal(failLine(["ok", "fail", "ok"]), "1 of the last 3 syncs failed.");
assert.equal(failLine(Array(10).fill("ok")), "0 of the last 10 syncs failed.");
assert.equal(failLine([]), ""); // no completed run: the line does not show
console.log("status.check: ok");
