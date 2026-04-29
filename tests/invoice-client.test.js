const test = require("node:test");
const assert = require("node:assert/strict");

const { buildInvoiceSaveRequest } = require("../src/lib/invoice-client");

test("buildInvoiceSaveRequest creates POST /api/invoices for new invoice", () => {
  const req = buildInvoiceSaveRequest({ invoiceNumber: "INV-1" });
  assert.equal(req.method, "POST");
  assert.equal(req.url, "/api/invoices");
});

test("buildInvoiceSaveRequest creates PUT /api/invoices/:id for existing invoice", () => {
  const req = buildInvoiceSaveRequest({ id: "abc", invoiceNumber: "INV-1" });
  assert.equal(req.method, "PUT");
  assert.equal(req.url, "/api/invoices/abc");
});

