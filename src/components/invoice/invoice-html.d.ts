export function renderInvoiceHtml(args: {
  theme: { id: string; direction: "ltr" | "rtl"; layoutVariant: string };
  tokens: Record<string, any>;
  invoice: any;
  payment: { instapayUrl?: string | null; vodafoneCashNumber?: string | null };
}): string;

