const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("invoice preview centers qty/price/amount headers and cells", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-preview.tsx", "utf8");
  assert.ok(text.includes(">{copy.qty}<") || text.includes("{copy.qty}"), "Expected qty label");
  assert.ok(text.includes('className={`text-center') || text.includes('className="text-center'), "Expected centered class used in table numeric columns");
});

test("invoice HTML centers numeric columns (num)", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-html.js", "utf8");
  assert.ok(text.includes(".num { text-align: center") || text.includes(".num { text-align: center;"), "Expected .num to be centered in HTML invoice");
});

test("invoice PDF centers numeric columns", () => {
  const text = fs.readFileSync("src/components/invoice/invoice-pdf.tsx", "utf8");
  assert.ok(text.includes('textAlign: "center"'), "Expected PDF cell alignment to center");
});

