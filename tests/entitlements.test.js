const test = require("node:test");
const assert = require("node:assert/strict");

const { entitlementForProduct } = require("../src/lib/entitlements");

test("monthly maps to PRO 30d", () => {
  const e = entitlementForProduct("PRO_MONTHLY", new Date("2026-01-01T00:00:00.000Z"));
  assert.equal(e.plan, "PRO");
  assert.ok(e.planExpiresAt);
});

test("yearly maps to PRO 365d", () => {
  const e = entitlementForProduct("PRO_YEARLY", new Date("2026-01-01T00:00:00.000Z"));
  assert.equal(e.plan, "PRO");
  assert.ok(e.planExpiresAt);
});

test("lifetime maps to LIFETIME no expiry", () => {
  const e = entitlementForProduct("LIFETIME", new Date("2026-01-01T00:00:00.000Z"));
  assert.equal(e.plan, "LIFETIME");
  assert.equal(e.planExpiresAt, null);
});

