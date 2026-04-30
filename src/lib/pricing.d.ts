export type Pricing = {
  currency: string;
  proMonthly: number;
  proYearly: number;
  lifetime: number;
};

export const DEFAULT_PRICING: Pricing;

export function normalizePricing(value: unknown): Pricing;

