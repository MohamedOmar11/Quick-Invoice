export type InvoiceStyle = {
  fontFamily: "inter" | "serif" | "mono";
  baseFontSize: number;
  headingWeight: number;
  accentColor: string;
  borderStyle: "none" | "thin" | "medium";
  borderRadius: number;
  tableStyle: "lines" | "boxed";
  zebraRows: boolean;
  spacing: "compact" | "normal" | "spacious";
};

export const defaultInvoiceStyle: InvoiceStyle;

export function mergeInvoiceStyle(userDefault: unknown, invoiceOverride: unknown): InvoiceStyle;

