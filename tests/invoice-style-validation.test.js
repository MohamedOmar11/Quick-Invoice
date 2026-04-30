const test = require("node:test");
const assert = require("node:assert/strict");

const { sanitizeInvoiceStyle, validateInvoiceStyleStrict } = require("../src/lib/invoice-style-validation");

test("validateInvoiceStyleStrict accepts known valid fields", () => {
  const res = validateInvoiceStyleStrict({
    accentColor: "#111111",
    backgroundColor: "#ffffff",
    borderStyle: "thin",
    baseFontSize: 12,
    showLogo: true,
    headerLayout: "split",
  });
  assert.equal(res.ok, true);
});

test("validateInvoiceStyleStrict rejects unknown keys", () => {
  const res = validateInvoiceStyleStrict({ notAKey: "x" });
  assert.equal(res.ok, false);
});

test("validateInvoiceStyleStrict rejects unsafe css injection strings", () => {
  const res = validateInvoiceStyleStrict({ accentColor: "</style><script>alert(1)</script>" });
  assert.equal(res.ok, false);
});

test("sanitizeInvoiceStyle drops invalid values", () => {
  const out = sanitizeInvoiceStyle({
    accentColor: "</style><script>alert(1)</script>",
    borderRadius: "12",
    logoSize: "lg",
  });
  assert.deepEqual(out, { borderRadius: 12, logoSize: "lg" });
});

