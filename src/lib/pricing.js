const DEFAULT_PRICING = {
  currency: "EGP",
  proMonthly: 150,
  proYearly: 1500,
  lifetime: 3000,
};

function normalizePricing(value) {
  const v = value && typeof value === "object" ? value : {};
  return {
    currency: typeof v.currency === "string" ? v.currency : DEFAULT_PRICING.currency,
    proMonthly: Number.isFinite(Number(v.proMonthly)) ? Number(v.proMonthly) : DEFAULT_PRICING.proMonthly,
    proYearly: Number.isFinite(Number(v.proYearly)) ? Number(v.proYearly) : DEFAULT_PRICING.proYearly,
    lifetime: Number.isFinite(Number(v.lifetime)) ? Number(v.lifetime) : DEFAULT_PRICING.lifetime,
  };
}

module.exports = { DEFAULT_PRICING, normalizePricing };

