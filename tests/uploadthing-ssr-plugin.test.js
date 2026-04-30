const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("RootLayout includes UploadThing NextSSRPlugin", () => {
  const text = fs.readFileSync("src/app/layout.tsx", "utf8");
  assert.ok(text.includes("NextSSRPlugin"), "Expected NextSSRPlugin to be used in RootLayout");
});

