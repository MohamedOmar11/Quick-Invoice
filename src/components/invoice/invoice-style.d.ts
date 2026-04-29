export type InvoiceStyle = {
  headerLayout: "split" | "left" | "right" | "center";
  showLogo: boolean;
  logoSize: "sm" | "md" | "lg";
  fontFamily: "inter" | "serif" | "mono";
  baseFontSize: number;
  headingWeight: number;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  tableHeaderBg: string;
  borderStyle: "none" | "thin" | "medium";
  borderRadius: number;
  tableStyle: "lines" | "boxed";
  showColumnBorders: boolean;
  rowSeparator: "none" | "thin" | "medium";
  cellPadding: "sm" | "md" | "lg";
  zebraRows: boolean;
  zebraColor: string;
  titleFontSize: number;
  labelFontSize: number;
  bodyFontSize: number;
  uppercaseLabels: boolean;
  spacing: "compact" | "normal" | "spacious";
};

export const defaultInvoiceStyle: InvoiceStyle;

export function mergeInvoiceStyle(userDefault: unknown, invoiceOverride: unknown): InvoiceStyle;

export function buildInvoiceStyle(
  baseTokens: unknown,
  userDefault: unknown,
  invoiceOverride: unknown
): InvoiceStyle;
