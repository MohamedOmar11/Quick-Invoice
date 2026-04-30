const test = require("node:test");
const assert = require("node:assert/strict");

const { renderInvoiceHtml } = require("../src/components/invoice/invoice-html");

test("invoice html respects body/title/label font sizes via tokens", () => {
  const html = renderInvoiceHtml({
    theme: { id: "minimal-corporate", direction: "ltr", layoutVariant: "grid" },
    tokens: { bodyFontSize: 14, labelFontSize: 11, titleFontSize: 40, fontFamily: "serif" },
    invoice: { invoiceNumber: "INV-1", clientName: "A", issueDate: "2026-01-01", dueDate: "2026-01-02", currency: "EGP", tax: 0, items: [{ title: "X", quantity: 1, price: 10 }] },
    payment: {},
  });

  assert.match(html, /font-size:\s*calc\(var\(--bodyFontSize, 12\) \* 1px\)/);
  assert.match(html, /--bodyFontSize:\s*14;/);
  assert.match(html, /--labelFontSize:\s*11;/);
  assert.match(html, /--titleFontSize:\s*40;/);
});
