const { sanitizeInvoiceStyle } = require("../../lib/invoice-style-validation");

function buildEffectiveTokens(themeTokens, userDefaults, invoiceOverrides) {
  const t = themeTokens && typeof themeTokens === "object" ? themeTokens : {};
  const u = userDefaults && typeof userDefaults === "object" ? userDefaults : {};
  const i = invoiceOverrides && typeof invoiceOverrides === "object" ? invoiceOverrides : {};
  return sanitizeInvoiceStyle({ ...t, ...u, ...i });
}

module.exports = { buildEffectiveTokens };
