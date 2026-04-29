const defaultInvoiceStyle = {
  fontFamily: "inter",
  baseFontSize: 12,
  headingWeight: 700,
  accentColor: "#111111",
  borderStyle: "thin",
  borderRadius: 10,
  tableStyle: "lines",
  zebraRows: false,
  spacing: "normal",
};

function mergeInvoiceStyle(userDefault, invoiceOverride) {
  const u = userDefault && typeof userDefault === "object" ? userDefault : {};
  const i = invoiceOverride && typeof invoiceOverride === "object" ? invoiceOverride : {};
  return { ...defaultInvoiceStyle, ...u, ...i };
}

module.exports = { defaultInvoiceStyle, mergeInvoiceStyle };

