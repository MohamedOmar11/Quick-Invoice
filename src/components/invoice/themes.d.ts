export type ThemeDirection = "ltr" | "rtl";

export type InvoiceTheme = {
  id: string;
  name: string;
  direction: ThemeDirection;
  layoutVariant: string;
  tokens: Record<string, any>;
};

export const themes: InvoiceTheme[];

export function getThemeById(id: string): InvoiceTheme;

