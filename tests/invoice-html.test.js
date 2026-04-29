const test = require("node:test");
const assert = require("node:assert/strict");

const { renderInvoiceHtml } = require("../src/components/invoice/invoice-html");

test("renders invoice html with tokens", () => {
  const html = renderInvoiceHtml({
    theme: { id: "minimal-corporate", direction: "ltr", layoutVariant: "grid" },
    tokens: {
      accentColor: "#123456",
      backgroundColor: "#ffffff",
      textColor: "#111111",
      mutedColor: "#666666",
      borderColor: "#e5e7eb",
      tableHeaderBg: "#f9fafb",
      borderRadius: 10,
    },
    invoice: {
      invoiceNumber: "INV-1",
      clientName: "Acme",
      clientEmail: "",
      issueDate: "2026-01-01",
      dueDate: "2026-01-15",
      currency: "EGP",
      tax: 0,
      notes: "",
      items: [{ title: "Work", quantity: 1, price: 100 }],
    },
    payment: { instapayUrl: null, vodafoneCashNumber: null },
  });
  assert.ok(html.includes("--accentColor: #123456"));
  assert.ok(html.includes("INV-1"));
  assert.ok(html.includes("Acme"));
});

