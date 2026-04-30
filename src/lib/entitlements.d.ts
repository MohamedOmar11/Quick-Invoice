export type ProductId = "PRO_MONTHLY" | "PRO_YEARLY" | "LIFETIME";

export function entitlementForProduct(
  product: ProductId,
  now?: Date
): { plan: "PRO" | "LIFETIME"; planExpiresAt: Date | null };

