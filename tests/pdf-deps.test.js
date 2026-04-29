const test = require("node:test");
const assert = require("node:assert/strict");

test("pdf deps are installed", () => {
  assert.ok(require("puppeteer-core"));
  assert.ok(require("@sparticuz/chromium"));
});

