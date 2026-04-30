const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("landing header centers nav links", () => {
  const text = fs.readFileSync("src/app/page.tsx", "utf8");
  assert.ok(text.includes("md:absolute"), "Expected centered nav positioning (absolute)");
  assert.ok(text.includes("md:left-1/2"), "Expected centered nav positioning (left-1/2)");
  assert.ok(text.includes("md:-translate-x-1/2"), "Expected centered nav positioning (translate)");
});

