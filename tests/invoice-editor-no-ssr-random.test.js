const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("invoice editor does not use Math.random/new Date in initial defaultValues (avoids hydration mismatch)", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-editor.tsx", "utf8");
  const idx = text.indexOf("const defaultValues");
  assert.ok(idx !== -1);
  const slice = text.slice(idx, idx + 500);
  assert.ok(!slice.includes("Math.random"), "Do not use Math.random in defaultValues during render");
  assert.ok(!slice.includes("new Date("), "Do not use new Date in defaultValues during render");
});

