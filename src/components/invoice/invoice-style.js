const defaultInvoiceStyle = {
  headerLayout: "split",
  showLogo: true,
  logoSize: "md",
  fontFamily: "inter",
  baseFontSize: 12,
  headingWeight: 700,
  accentColor: "#111111",
  backgroundColor: "#ffffff",
  textColor: "#111111",
  mutedColor: "#6b7280",
  borderColor: "#e5e7eb",
  tableHeaderBg: "#f9fafb",
  borderStyle: "thin",
  borderRadius: 10,
  tableStyle: "lines",
  showColumnBorders: false,
  rowSeparator: "thin",
  cellPadding: "md",
  zebraRows: false,
  zebraColor: "#f9fafb",
  titleFontSize: 32,
  labelFontSize: 10,
  bodyFontSize: 12,
  uppercaseLabels: true,
  spacing: "normal",
};

function mergeInvoiceStyle(userDefault, invoiceOverride) {
  const u = userDefault && typeof userDefault === "object" ? userDefault : {};
  const i = invoiceOverride && typeof invoiceOverride === "object" ? invoiceOverride : {};
  return { ...defaultInvoiceStyle, ...u, ...i };
}

module.exports = { defaultInvoiceStyle, mergeInvoiceStyle };
