const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("dashboard recent invoices table has increased horizontal padding", () => {
  const text = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");
  assert.ok(text.includes("[&_th]:px-4"), "Expected table head padding to be increased");
  assert.ok(text.includes("[&_td]:px-4"), "Expected table cell padding to be increased");
});

