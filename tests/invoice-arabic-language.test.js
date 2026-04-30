const test = require("node:test");
const assert = require("node:assert/strict");

const { renderInvoiceHtml } = require("../src/components/invoice/invoice-html");

test("Arabic themes render Arabic labels in HTML", () => {
  const html = renderInvoiceHtml({
    theme: { id: "arabic-diwan", direction: "rtl", layoutVariant: "arabic-diwan" },
    tokens: { accentColor: "#0f766e" },
    invoice: {
      invoiceNumber: "INV-1",
      clientName: "عميل اختبار",
      clientEmail: "a@b.com",
      issueDate: "2026-01-01",
      dueDate: "2026-01-15",
      currency: "EGP",
      tax: 0,
      notes: "ملاحظة",
      items: [{ title: "خدمة", quantity: 1, price: 10 }],
    },
    payment: { instapayUrl: null, vodafoneCashNumber: null },
    brand: { name: "شركتي", logoUrl: "" },
    watermarkText: "",
  });

  assert.ok(html.includes('lang="ar"'), "Expected Arabic lang attribute");
  assert.ok(html.includes("فاتورة"), "Expected Arabic invoice label/title");
  assert.ok(html.includes("العميل"), "Expected Arabic 'Bill To' label");
  assert.ok(html.includes("تاريخ الإصدار"), "Expected Arabic issue date label");
  assert.ok(html.includes("تاريخ الاستحقاق"), "Expected Arabic due date label");
});

