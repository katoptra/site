// The self-check for status.js. To run it: node assets/js/status.check.mjs
import { strict as assert } from "node:assert";
import { failText, fill, lastSuccess, nextText, relTime, segments, shortTime, span, stateFor } from "./status.js";

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

assert.deepEqual(segments({ workflow_runs: runs }), ["ok", "ok", "fail", "run"]); // oldest first, and the in-progress run is the newest
const cancelled = { status: "completed", conclusion: "cancelled" };
const eleven = [cancelled, ...Array(10).fill({ status: "completed", conclusion: "success" })];
assert.deepEqual(segments({ workflow_runs: eleven }), [...Array(9).fill("ok"), "skip"]); // the newest 10 only, and a cancelled run is skipped
assert.deepEqual(
  segments({ workflow_runs: ["timed_out", "skipped", "startup_failure", "stale"].map((conclusion) => ({ status: "completed", conclusion })) }),
  ["skip", "fail", "skip", "fail"],
); // oldest first: stale and skipped are skipped, startup_failure and timed_out fail
assert.equal(failText(["ok", "skip", "ok"]), "none failed"); // a skipped run is not a failed run
assert.deepEqual(segments({}), []);

assert.equal(fill("2026-09-01T11:42:00Z", 60, now), 30); // 18 of 60 minutes
assert.equal(fill("2026-09-01T00:00:00Z", 720, now), 100); // 12 of 12 hours
assert.equal(fill("2026-08-30T12:00:00Z", 60, now), 100); // late: the next-sync bar stays full
assert.equal(fill("2026-09-01T12:05:00Z", 60, now), 0); // a clock in the future does not give a negative value

assert.equal(failText(["ok", "fail", "ok", "fail"]), "2 failed");
assert.equal(failText(Array(10).fill("ok")), "none failed");

assert.equal(span(43), "43 min");
assert.equal(span(60), "1 hour");
assert.equal(span(13 * 60 + 10), "13 hours");
assert.equal(span(3 * 1440), "3 days");
const start = "2026-09-01T11:42:00Z"; // 18 min before now
assert.equal(nextText(start, 60, false, false, now), "in 42 min");
assert.equal(nextText(start, 720, false, false, now), "in 12 hours"); // 702 min rounds to 12 hours
assert.equal(nextText("2026-09-01T10:42:00Z", 60, false, false, now), "due now"); // past due, healthcheck in grace
assert.equal(nextText("2026-09-01T08:42:00Z", 60, false, true, now), "late by 2 hours"); // past due, healthcheck down
assert.equal(nextText("2026-09-01T10:42:00Z", 60, true, true, now), "in progress"); // a run in progress wins
console.log("status.check: ok");
