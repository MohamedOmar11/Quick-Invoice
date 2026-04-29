function buildInvoiceSaveRequest(input) {
  if (input && input.id) {
    return { url: `/api/invoices/${input.id}`, method: "PUT" };
  }

  return { url: "/api/invoices", method: "POST" };
}

module.exports = { buildInvoiceSaveRequest };

