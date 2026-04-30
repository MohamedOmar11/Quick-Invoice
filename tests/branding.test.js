const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("root metadata uses Hesaby branding", () => {
  const text = fs.readFileSync("src/app/layout.tsx", "utf8");
  assert.ok(text.includes('title: "Hesaby'), "Expected metadata.title to include Hesaby");
});

