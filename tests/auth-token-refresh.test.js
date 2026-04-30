const test = require("node:test");
const assert = require("node:assert/strict");

const { shouldRefreshAuthToken } = require("../src/lib/auth-token-refresh");

test("shouldRefreshAuthToken refreshes when lastSync is missing", () => {
  assert.equal(shouldRefreshAuthToken(undefined, 60_000), true);
});

test("shouldRefreshAuthToken does not refresh within window", () => {
  const now = Date.now();
  assert.equal(shouldRefreshAuthToken(now - 30_000, 60_000, now), false);
});

test("shouldRefreshAuthToken refreshes after window", () => {
  const now = Date.now();
  assert.equal(shouldRefreshAuthToken(now - 61_000, 60_000, now), true);
});

