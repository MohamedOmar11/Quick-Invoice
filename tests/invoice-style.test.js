const test = require("node:test");
const assert = require("node:assert/strict");

const { mergeInvoiceStyle, defaultInvoiceStyle } = require("../src/components/invoice/invoice-style");

test("mergeInvoiceStyle uses invoice override over user default", () => {
  const user = { accentColor: "#111111" };
  const invoice = { accentColor: "#222222" };
  const merged = mergeInvoiceStyle(user, invoice);
  assert.equal(merged.accentColor, "#222222");
});

test("mergeInvoiceStyle falls back to defaults", () => {
  const merged = mergeInvoiceStyle(null, null);
  assert.equal(merged.borderStyle, defaultInvoiceStyle.borderStyle);
  assert.equal(merged.headerLayout, defaultInvoiceStyle.headerLayout);
  assert.equal(merged.showLogo, defaultInvoiceStyle.showLogo);
});
