const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("UploadThing route checks for UPLOADTHING_TOKEN", () => {
  const text = fs.readFileSync("src/app/api/uploadthing/route.ts", "utf8");
  assert.ok(text.includes("UPLOADTHING_TOKEN"));
});

