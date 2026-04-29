const test = require("node:test");
const assert = require("node:assert/strict");

const { getThemeById } = require("../src/components/invoice/themes");
const { buildEffectiveTokens } = require("../src/components/invoice/theme-tokens");

test("returns known theme", () => {
  const t = getThemeById("minimal-corporate");
  assert.equal(t.id, "minimal-corporate");
});

test("buildEffectiveTokens applies overrides", () => {
  const t = getThemeById("minimal-corporate");
  const tokens = buildEffectiveTokens(t.tokens, { accentColor: "#111111" }, { accentColor: "#222222" });
  assert.equal(tokens.accentColor, "#222222");
});

