const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("landing page hides pricing section and nav link when session exists", () => {
  const text = fs.readFileSync("src/app/page.tsx", "utf8");
  assert.ok(text.includes("const session = await getServerSession(authOptions);"));
  assert.ok(text.includes("!session?.user?.id"), "Expected code to branch on !session?.user?.id");
  assert.ok(text.includes('href="#pricing"'), "Expected pricing link to exist in logged-out state");
  assert.ok(text.includes('id="pricing"'), "Expected pricing section to exist in logged-out state");
});

