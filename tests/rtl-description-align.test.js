const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("RTL description header aligns to start (right in Arabic)", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-preview.tsx", "utf8");
  assert.ok(!text.includes("text-left py-3"), "Do not force left alignment for description header");
  assert.ok(text.includes('textAlign: "start"'), "Expected logical text alignment for RTL/LTR");
});

