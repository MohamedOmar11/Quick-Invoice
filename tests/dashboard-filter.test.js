const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeClientFilter } = require("../src/lib/dashboard-filters");

test("normalizeClientFilter trims and caps length", () => {
  const q = "   " + "a".repeat(500) + "   ";
  const out = normalizeClientFilter(q);
  assert.ok(out.length <= 120);
  assert.equal(out[0], "a");
});

