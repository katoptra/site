// Self-check for relTime; run with: node assets/js/status.check.mjs
import { strict as assert } from "node:assert";
import { relTime, stateFor } from "./status.js";

assert.equal(stateFor({ status: "up", total: 2, grace: 0, down: 0 }), "up");
assert.equal(stateFor({ status: "up", total: 2, grace: 1, down: 0 }), "late");
assert.equal(stateFor({ status: "late", total: 1, grace: 0, down: 0 }), "late");
assert.equal(stateFor({ status: "down", total: 2, grace: 1, down: 1 }), "down");

const now = Date.parse("2026-09-01T12:00:00Z");
assert.equal(relTime("2026-09-01T11:59:40Z", now), "just now");
assert.equal(relTime("2026-09-01T11:26:00Z", now), "34 min ago");
assert.equal(relTime("2026-09-01T10:58:00Z", now), "1 hour ago");
assert.equal(relTime("2026-09-01T04:00:00Z", now), "8 hours ago");
assert.equal(relTime("2026-08-29T12:00:00Z", now), "3 days ago");
console.log("status.check: ok");
