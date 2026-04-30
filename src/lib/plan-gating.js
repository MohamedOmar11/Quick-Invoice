function freeMonthlyInvoiceLimit() {
  return 3;
}

function isTemplateAllowedForPlan(plan, templateId) {
  if (plan === "FREE") return templateId === "minimal-corporate";
  return true;
}

function effectivePlanForUser(user, now = new Date()) {
  const plan = user?.plan ?? "FREE";
  const expiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  if (plan === "PRO" && expiresAt && expiresAt < now) return "FREE";
  return plan;
}

module.exports = { freeMonthlyInvoiceLimit, isTemplateAllowedForPlan, effectivePlanForUser };

