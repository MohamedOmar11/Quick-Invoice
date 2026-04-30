const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("landing page header logo is not oversized", () => {
  const text = fs.readFileSync("src/app/page.tsx", "utf8");
  assert.ok(text.includes('className="h-16 w-auto"'), "Expected landing header logo to be h-16");
});

