const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("uploadthing react helpers module is a client module", () => {
  const text = fs.readFileSync("src/utils/uploadthing.ts", "utf8");
  assert.ok(text.trimStart().startsWith("\"use client\""), "Expected src/utils/uploadthing.ts to start with \"use client\"");
});

