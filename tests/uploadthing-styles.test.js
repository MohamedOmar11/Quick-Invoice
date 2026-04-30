const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("globals.css imports uploadthing styles", () => {
  const text = fs.readFileSync("src/app/globals.css", "utf8");
  assert.ok(text.includes("@uploadthing/react/styles.css"));
});

