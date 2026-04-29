import type { InvoiceStyle } from "@/components/invoice/invoice-style";

export type InvoicePreviewData = {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  tax: number;
  notes?: string;
  items: Array<{ title: string; quantity: number; price: number }>;
};

function money(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export function InvoicePreview({
  style,
  data,
}: {
  style: InvoiceStyle;
  data: InvoicePreviewData;
}) {
  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = subtotal * (data.tax / 100);
  const total = subtotal + taxAmount;

  const padding =
    style.spacing === "spacious" ? 44 : style.spacing === "compact" ? 24 : 32;

  const fontClass =
    style.fontFamily === "mono"
      ? "font-mono"
      : style.fontFamily === "serif"
      ? "font-serif"
      : "font-sans";

  const borderClass =
    style.borderStyle === "none"
      ? "border-0"
      : style.borderStyle === "medium"
      ? "border-2 border-gray-300"
      : "border border-gray-200";

  const tableBoxed = style.tableStyle === "boxed";

  return (
    <div
      className={`bg-white text-black shadow-lg max-w-2xl mx-auto aspect-[1/1.4] relative print-ready ${fontClass} ${borderClass}`}
      style={{ borderRadius: style.borderRadius, padding }}
    >
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-2">Invoice</div>
          <h1
            className="text-4xl tracking-tighter"
            style={{ fontWeight: style.headingWeight, color: style.accentColor }}
          >
            INVOICE
          </h1>
          <p className="text-gray-500 text-sm">#{data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold mb-4 ml-auto">
            LOGO
          </div>
          <h2 className="font-semibold text-gray-800">Your Company</h2>
        </div>
      </div>

      <div className="flex justify-between mb-8 pb-5 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Bill To</p>
          <p className="font-semibold text-gray-800 text-lg">{data.clientName || "Client Name"}</p>
          {data.clientEmail && <p className="text-gray-600 text-sm">{data.clientEmail}</p>}
        </div>
        <div className="text-right">
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Issue Date</p>
            <p className="text-gray-800 text-sm">{data.issueDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Due Date</p>
            <p className="text-gray-800 text-sm">{data.dueDate}</p>
          </div>
        </div>
      </div>

      <table className={`w-full mb-8 ${tableBoxed ? "border border-gray-200" : ""}`}>
        <thead>
          <tr className={tableBoxed ? "border-b border-gray-200 bg-gray-50" : "border-b border-gray-200"}>
            <th className="text-left py-3 px-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">
              Description
            </th>
            <th className="text-right py-3 px-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">
              Qty
            </th>
            <th className="text-right py-3 px-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">
              Price
            </th>
            <th className="text-right py-3 px-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr
              key={i}
              className={`${tableBoxed ? "border-b border-gray-200" : "border-b border-gray-100"} ${
                style.zebraRows && i % 2 === 1 ? "bg-gray-50" : ""
              }`}
            >
              <td className="py-4 px-3 text-gray-800 text-sm" style={{ fontSize: style.baseFontSize }}>
                {item.title || "Item description"}
              </td>
              <td className="text-right py-4 px-3 text-gray-600 text-sm" style={{ fontSize: style.baseFontSize }}>
                {item.quantity}
              </td>
              <td className="text-right py-4 px-3 text-gray-600 text-sm" style={{ fontSize: style.baseFontSize }}>
                {money(item.price)}
              </td>
              <td className="text-right py-4 px-3 text-gray-800 font-medium text-sm" style={{ fontSize: style.baseFontSize }}>
                {money(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>
              {money(subtotal)} {data.currency}
            </span>
          </div>
          {data.tax > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({data.tax}%)</span>
              <span>
                {money(taxAmount)} {data.currency}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg pt-3 border-t border-gray-200" style={{ fontWeight: style.headingWeight }}>
            <span>Total</span>
            <span>
              {money(total)} {data.currency}
            </span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="mt-10 pt-6 border-t border-gray-200 text-gray-500 text-sm">
          <p className="font-semibold text-gray-700 mb-2">Notes</p>
          <p className="whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}

      <div className="absolute bottom-8 left-8 text-xs text-gray-300 font-medium tracking-widest uppercase">
        Created with QuickInvoice
      </div>
    </div>
  );
}
