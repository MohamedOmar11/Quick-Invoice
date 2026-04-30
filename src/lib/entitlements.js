function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function entitlementForProduct(product, now = new Date()) {
  if (product === "LIFETIME") {
    return { plan: "LIFETIME", planExpiresAt: null };
  }

  if (product === "PRO_YEARLY") {
    return { plan: "PRO", planExpiresAt: addDays(now, 365) };
  }

  if (product === "PRO_MONTHLY") {
    return { plan: "PRO", planExpiresAt: addDays(now, 30) };
  }

  return { plan: "PRO", planExpiresAt: null };
}

module.exports = { entitlementForProduct };

