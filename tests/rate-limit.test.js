const test = require("node:test");
const assert = require("node:assert/strict");

const { checkRateLimit } = require("../src/lib/rate-limit");

test("checkRateLimit allows up to limit within window", () => {
  const key = `t-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < 3; i++) {
    const r = checkRateLimit({ key, limit: 3, windowMs: 10_000 });
    assert.equal(r.ok, true);
  }
  const r2 = checkRateLimit({ key, limit: 3, windowMs: 10_000 });
  assert.equal(r2.ok, false);
  assert.equal(r2.status, 429);
});

