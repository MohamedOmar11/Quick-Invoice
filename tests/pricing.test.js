const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizePricing } = require("../src/lib/pricing");

test("normalizePricing fills defaults", () => {
  const p = normalizePricing(null);
  assert.equal(p.currency, "EGP");
  assert.equal(p.proMonthly, 150);
  assert.equal(p.proYearly, 1500);
  assert.equal(p.lifetime, 3000);
});

