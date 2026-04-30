const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Topbar logout is triggered via DropdownMenuItem onSelect (not embedded LogoutButton)", () => {
  const text = fs.readFileSync("src/components/dashboard/topbar.tsx", "utf8");
  assert.ok(text.includes("setLogoutOpen(true)"), "Expected topbar to control logout dialog state");
  assert.ok(text.includes("onSelect={() => setLogoutOpen(true)}") || text.includes("onSelect={() => {"), "Expected logout dropdown item to open dialog");
  const dropdownBlock = text.split("<DropdownMenuContent")[1] || "";
  assert.ok(!dropdownBlock.includes("<LogoutButton"), "Expected profile dropdown not to embed LogoutButton");
});
