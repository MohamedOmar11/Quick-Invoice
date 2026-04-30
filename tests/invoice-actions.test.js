const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("dashboard invoices table wires duplicate/delete actions", () => {
  const text = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");
  assert.ok(text.includes("InvoiceRowActions"), "Expected InvoiceRowActions to be used on dashboard invoices");
});

test("duplicate invoice API route exists", () => {
  const text = fs.readFileSync("src/app/api/invoices/[id]/duplicate/route.ts", "utf8");
  assert.ok(text.includes("export async function POST"), "Expected POST handler");
  assert.ok(text.includes("prisma.invoice.create"), "Expected invoice duplication to create invoice");
});

