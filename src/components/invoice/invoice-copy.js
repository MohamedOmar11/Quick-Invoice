function getInvoiceCopy(themeId) {
  const id = typeof themeId === "string" ? themeId : "";
  const isArabic = id === "arabic-diwan" || id === "arabic-modern";

  if (isArabic) {
    return {
      lang: "ar",
      invoiceKicker: "فاتورة",
      invoiceTitle: "فاتورة",
      billTo: "العميل",
      issueDate: "تاريخ الإصدار",
      dueDate: "تاريخ الاستحقاق",
      description: "الوصف",
      qty: "الكمية",
      price: "السعر",
      amount: "الإجمالي",
      subtotal: "المجموع الفرعي",
      tax: "الضريبة",
      total: "الإجمالي",
      notes: "ملاحظات",
      vodafoneCash: "فودافون كاش",
      instapay: "إنستا باي",
      payWithInstapay: "ادفع عبر إنستا باي",
      logoPlaceholder: "شعار",
      clientNamePlaceholder: "اسم العميل",
      itemPlaceholder: "وصف الخدمة",
      yourCompany: "شركتك",
    };
  }

  return {
    lang: "en",
    invoiceKicker: "Invoice",
    invoiceTitle: "INVOICE",
    billTo: "Bill To",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    description: "Description",
    qty: "Qty",
    price: "Price",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    notes: "Notes",
    vodafoneCash: "Vodafone Cash",
    instapay: "InstaPay",
    payWithInstapay: "Pay with InstaPay",
    logoPlaceholder: "LOGO",
    clientNamePlaceholder: "Client Name",
    itemPlaceholder: "Item description",
    yourCompany: "Your Company",
  };
}

module.exports = { getInvoiceCopy };
