const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("theme selector trigger/content are wide enough to show checkmark", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-editor.tsx", "utf8");
  assert.ok(text.includes("<Label>Theme</Label>"));
  assert.ok(text.includes("min-w-[260px]"), "Expected Theme select to have min-w-[260px]");
});

