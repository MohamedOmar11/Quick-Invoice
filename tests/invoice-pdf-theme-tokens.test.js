const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("InvoicePdf uses theme tokens based on invoice.template", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-pdf.tsx", "utf8");
  assert.ok(text.includes("getThemeById"), "Expected InvoicePdf to reference getThemeById");
  assert.ok(text.includes("buildInvoiceStyle"), "Expected InvoicePdf to use buildInvoiceStyle (theme + defaults + override)");
  assert.ok(text.includes("invoice?.template") || text.includes("invoice.template"), "Expected InvoicePdf to use invoice.template");
});

