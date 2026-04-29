export type InvoiceThemeId =
  | "minimal"
  | "classic-ledger"
  | "modern-stripe"
  | "elegant-serif"
  | "mono-pro"
  | "corner-stamp"
  | "soft-pastel"
  | "dark-header"
  | "split-panel"
  | "compact-pro";

export const invoiceThemes: Array<{ id: InvoiceThemeId; name: string }> = [
  { id: "minimal", name: "Minimal" },
  { id: "classic-ledger", name: "Classic Ledger" },
  { id: "modern-stripe", name: "Modern Stripe" },
  { id: "elegant-serif", name: "Elegant Serif" },
  { id: "mono-pro", name: "Mono Pro" },
  { id: "corner-stamp", name: "Corner Stamp" },
  { id: "soft-pastel", name: "Soft Pastel" },
  { id: "dark-header", name: "Dark Header" },
  { id: "split-panel", name: "Split Panel" },
  { id: "compact-pro", name: "Compact Pro" },
];

export function coerceInvoiceThemeId(value: unknown): InvoiceThemeId {
  const id = typeof value === "string" ? value : "";
  const match = invoiceThemes.find((t) => t.id === id);
  return match?.id ?? "minimal";
}

