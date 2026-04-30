const test = require("node:test");
const assert = require("node:assert/strict");

const { isTemplateAllowedForPlan, freeMonthlyInvoiceLimit, effectivePlanForUser } = require("../src/lib/plan-gating");

test("free plan invoice limit is 3", () => {
  assert.equal(freeMonthlyInvoiceLimit(), 3);
});

test("free plan only allows minimal-corporate", () => {
  assert.equal(isTemplateAllowedForPlan("FREE", "minimal-corporate"), true);
  assert.equal(isTemplateAllowedForPlan("FREE", "bold-stripe"), false);
});

test("pro plan allows all templates", () => {
  assert.equal(isTemplateAllowedForPlan("PRO", "bold-stripe"), true);
});

test("effectivePlanForUser downgrades expired pro", () => {
  const plan = effectivePlanForUser({ plan: "PRO", planExpiresAt: new Date("2020-01-01T00:00:00.000Z") }, new Date("2026-01-01T00:00:00.000Z"));
  assert.equal(plan, "FREE");
});

