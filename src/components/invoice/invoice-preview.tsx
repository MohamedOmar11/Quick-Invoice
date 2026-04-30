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
  payment,
  direction,
}: {
  style: InvoiceStyle;
  data: InvoicePreviewData;
  payment?: { instapayUrl?: string | null; vodafoneCashNumber?: string | null };
  direction?: "ltr" | "rtl";
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

  const borderWidth =
    style.borderStyle === "none" ? 0 : style.borderStyle === "medium" ? 2 : 1;

  const tableBoxed = style.tableStyle === "boxed";
  const cellPad =
    style.cellPadding === "lg" ? 14 : style.cellPadding === "sm" ? 8 : 10;
  const rowSepWidth =
    style.rowSeparator === "none" ? 0 : style.rowSeparator === "medium" ? 2 : 1;
  const labelClass = style.uppercaseLabels ? "uppercase tracking-wider" : "";
  const headerAlign =
    style.headerLayout === "center"
      ? "text-center"
      : style.headerLayout === "right"
      ? "text-right"
      : "text-left";
  const logoPx = style.logoSize === "lg" ? 80 : style.logoSize === "sm" ? 48 : 64;

  return (
    <div
      className={`shadow-lg max-w-2xl mx-auto aspect-[1/1.4] relative print-ready ${fontClass}`}
      dir={direction}
      style={{
        borderRadius: style.borderRadius,
        padding,
        borderWidth,
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        borderStyle: "solid",
      }}
    >
      <div className={`flex items-start mb-10 ${style.headerLayout === "center" ? "justify-center" : "justify-between"}`}>
        <div className={`${headerAlign} ${style.headerLayout === "split" ? "" : "flex-1"}`}>
          <div className={`text-xs font-semibold mb-2 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
            Invoice
          </div>
          <h1
            className="tracking-tighter"
            style={{
              fontWeight: style.headingWeight,
              color: style.accentColor,
              fontSize: style.titleFontSize,
              lineHeight: 1.05,
            }}
          >
            INVOICE
          </h1>
          <div style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>
            #{data.invoiceNumber}
          </div>
        </div>

        {style.headerLayout === "split" && (
          <div className="text-right">
            {style.showLogo && (
              <div
                className="bg-gray-100 rounded-md flex items-center justify-center font-bold mb-4 ml-auto"
                style={{
                  width: logoPx,
                  height: logoPx,
                  color: style.mutedColor,
                  backgroundColor: "#f3f4f6",
                }}
              >
                LOGO
              </div>
            )}
            <div className="font-semibold" style={{ color: style.textColor, fontSize: style.bodyFontSize }}>
              Your Company
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mb-8 pb-5" style={{ borderBottomWidth: 1, borderBottomColor: style.borderColor, borderBottomStyle: "solid" }}>
        <div>
          <p className={`font-semibold mb-1 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
            Bill To
          </p>
          <p className="font-semibold" style={{ fontSize: style.bodyFontSize + 4, color: style.textColor }}>
            {data.clientName || "Client Name"}
          </p>
          {data.clientEmail && <p style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>{data.clientEmail}</p>}
        </div>
        <div className="text-right">
          <div className="mb-4">
            <p className={`font-semibold mb-1 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
              Issue Date
            </p>
            <p style={{ fontSize: style.bodyFontSize }}>{data.issueDate}</p>
          </div>
          <div>
            <p className={`font-semibold mb-1 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
              Due Date
            </p>
            <p style={{ fontSize: style.bodyFontSize }}>{data.dueDate}</p>
          </div>
        </div>
      </div>

      <table
        className="w-full mb-8"
        style={
          tableBoxed
            ? { borderWidth: 1, borderColor: style.borderColor, borderStyle: "solid" }
            : undefined
        }
      >
        <thead>
          <tr
            style={{
              borderBottomWidth: 1,
              borderBottomColor: style.borderColor,
              borderBottomStyle: "solid",
              backgroundColor: tableBoxed ? style.tableHeaderBg : undefined,
            }}
          >
            <th className={`text-left py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              Description
            </th>
            <th className={`text-right py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              Qty
            </th>
            <th className={`text-right py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              Price
            </th>
            <th className={`text-right py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr
              key={i}
              style={{
                borderBottomWidth: rowSepWidth,
                borderBottomColor: style.borderColor,
                borderBottomStyle: "solid",
                backgroundColor: style.zebraRows && i % 2 === 1 ? style.zebraColor : undefined,
              }}
            >
              <td
                className="py-4"
                style={{
                  paddingLeft: cellPad,
                  paddingRight: cellPad,
                  fontSize: style.bodyFontSize,
                  borderRightWidth: style.showColumnBorders ? 1 : 0,
                  borderRightColor: style.borderColor,
                  borderRightStyle: "solid",
                }}
              >
                {item.title || "Item description"}
              </td>
              <td
                className="text-right py-4"
                style={{
                  paddingLeft: cellPad,
                  paddingRight: cellPad,
                  fontSize: style.bodyFontSize,
                  color: style.mutedColor,
                  borderRightWidth: style.showColumnBorders ? 1 : 0,
                  borderRightColor: style.borderColor,
                  borderRightStyle: "solid",
                }}
              >
                {item.quantity}
              </td>
              <td
                className="text-right py-4"
                style={{
                  paddingLeft: cellPad,
                  paddingRight: cellPad,
                  fontSize: style.bodyFontSize,
                  color: style.mutedColor,
                  borderRightWidth: style.showColumnBorders ? 1 : 0,
                  borderRightColor: style.borderColor,
                  borderRightStyle: "solid",
                }}
              >
                {money(item.price)}
              </td>
              <td
                className="text-right py-4 font-medium"
                style={{
                  paddingLeft: cellPad,
                  paddingRight: cellPad,
                  fontSize: style.bodyFontSize,
                }}
              >
                {money(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-10">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm" style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>
            <span>Subtotal</span>
            <span>
              {money(subtotal)} {data.currency}
            </span>
          </div>
          {data.tax > 0 && (
            <div className="flex justify-between text-sm" style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>
              <span>Tax ({data.tax}%)</span>
              <span>
                {money(taxAmount)} {data.currency}
              </span>
            </div>
          )}
          <div
            className="flex justify-between text-lg pt-3"
            style={{
              fontWeight: style.headingWeight,
              borderTopWidth: 1,
              borderTopColor: style.borderColor,
              borderTopStyle: "solid",
              fontSize: style.bodyFontSize + 4,
            }}
          >
            <span>Total</span>
            <span>
              {money(total)} {data.currency}
            </span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="mt-10 pt-6 text-sm" style={{ borderTopWidth: 1, borderTopColor: style.borderColor, borderTopStyle: "solid", color: style.mutedColor, fontSize: style.bodyFontSize }}>
          <p className="font-semibold mb-2" style={{ color: style.textColor }}>Notes</p>
          <p className="whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}

      {(payment?.instapayUrl || payment?.vodafoneCashNumber) && (
        <div
          className="mt-8 pt-6 text-sm"
          style={{
            borderTopWidth: 1,
            borderTopColor: style.borderColor,
            borderTopStyle: "solid",
            color: style.mutedColor,
            fontSize: style.bodyFontSize,
          }}
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              {payment?.vodafoneCashNumber && <div>Vodafone Cash: {payment.vodafoneCashNumber}</div>}
            </div>
            {payment?.instapayUrl && (
              <a
                href={payment.instapayUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: style.accentColor }}
              >
                Pay with InstaPay
              </a>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-8 text-xs text-gray-300 font-medium tracking-widest uppercase">
        Created with Hesaby
      </div>
    </div>
  );
}
