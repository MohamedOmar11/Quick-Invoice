function buildEffectiveTokens(themeTokens, userDefaults, invoiceOverrides) {
  const t = themeTokens && typeof themeTokens === "object" ? themeTokens : {};
  const u = userDefaults && typeof userDefaults === "object" ? userDefaults : {};
  const i = invoiceOverrides && typeof invoiceOverrides === "object" ? invoiceOverrides : {};
  return { ...t, ...u, ...i };
}

module.exports = { buildEffectiveTokens };

