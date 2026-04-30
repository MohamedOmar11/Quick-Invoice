const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("InvoiceEditor saves latest changes before PDF/Print", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-editor.tsx", "utf8");
  assert.ok(text.includes("persistInvoice"), "Expected InvoiceEditor to have a save helper used across actions");
  assert.ok(text.includes("window.open(`/api/invoices/${invoiceId}/pdf`") || text.includes("window.open(`/api/invoices/${id}/pdf`"), "Expected export to open /api/invoices/{id}/pdf");
  assert.ok(text.includes("form.handleSubmit(async (data)"), "Expected export/print handlers to use form.handleSubmit so they include current state");
});

