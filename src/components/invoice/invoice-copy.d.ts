export type InvoiceCopy = {
  lang: "en" | "ar";
  invoiceKicker: string;
  invoiceTitle: string;
  billTo: string;
  issueDate: string;
  dueDate: string;
  description: string;
  qty: string;
  price: string;
  amount: string;
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  vodafoneCash: string;
  instapay: string;
  payWithInstapay: string;
  logoPlaceholder: string;
  clientNamePlaceholder: string;
  itemPlaceholder: string;
  yourCompany: string;
};

export function getInvoiceCopy(themeId: unknown): InvoiceCopy;
