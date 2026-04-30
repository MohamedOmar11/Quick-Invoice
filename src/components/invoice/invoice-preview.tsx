import type { InvoiceStyle } from "@/components/invoice/invoice-style";
import { getInvoiceCopy } from "@/components/invoice/invoice-copy";

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
  themeId,
  style,
  data,
  payment,
  direction,
  brand,
  watermarkText,
}: {
  themeId?: string;
  style: InvoiceStyle;
  data: InvoicePreviewData;
  payment?: { instapayUrl?: string | null; vodafoneCashNumber?: string | null };
  direction?: "ltr" | "rtl";
  brand?: { name?: string | null; logoUrl?: string | null };
  watermarkText?: string;
}) {
  const copy = getInvoiceCopy(themeId);
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

  const fontFamily =
    style.fontFamily === "mono"
      ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
      : style.fontFamily === "serif"
      ? "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif"
      : "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"";

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
  const logoPx = style.logoSize === "lg" ? 120 : style.logoSize === "sm" ? 72 : 96;
  const brandName = brand?.name || copy.yourCompany;
  const logoUrl = brand?.logoUrl || "";

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
        fontFamily,
      }}
    >
      {watermarkText ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
          <div className="text-5xl tracking-[0.25em] uppercase rotate-[-20deg] text-black/10">
            {watermarkText}
          </div>
        </div>
      ) : null}
      <div className={`flex items-start mb-10 ${style.headerLayout === "center" ? "justify-center" : "justify-between"}`}>
        <div className={`${headerAlign} ${style.headerLayout === "split" ? "" : "flex-1"}`}>
          <div className={`text-xs font-semibold mb-2 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
            {copy.invoiceKicker}
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
            {copy.invoiceTitle}
          </h1>
          <div style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>
            #{data.invoiceNumber}
          </div>
        </div>

        {style.headerLayout === "split" && (
          <div className="text-right">
            {style.showLogo && (
              logoUrl ? (
                <img
                  alt="Logo"
                  src={logoUrl}
                  className="rounded-md mb-4 ml-auto bg-white"
                  style={{
                    width: logoPx,
                    height: logoPx,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  className="bg-gray-100 rounded-md flex items-center justify-center font-bold mb-4 ml-auto"
                  style={{
                    width: logoPx,
                    height: logoPx,
                    color: style.mutedColor,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  {copy.logoPlaceholder}
                </div>
              )
            )}
            <div className="font-semibold" style={{ color: style.textColor, fontSize: style.bodyFontSize }}>
              {brandName}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mb-8 pb-5" style={{ borderBottomWidth: 1, borderBottomColor: style.borderColor, borderBottomStyle: "solid" }}>
        <div>
          <p className={`font-semibold mb-1 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
            {copy.billTo}
          </p>
          <p className="font-semibold" style={{ fontSize: style.bodyFontSize + 4, color: style.textColor }}>
            {data.clientName || copy.clientNamePlaceholder}
          </p>
          {data.clientEmail && <p style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>{data.clientEmail}</p>}
        </div>
        <div className="text-right">
          <div className="mb-4">
            <p className={`font-semibold mb-1 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
              {copy.issueDate}
            </p>
            <p style={{ fontSize: style.bodyFontSize }}>{data.issueDate}</p>
          </div>
          <div>
            <p className={`font-semibold mb-1 ${labelClass}`} style={{ fontSize: style.labelFontSize, color: style.mutedColor }}>
              {copy.dueDate}
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
            <th className={`py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor, textAlign: "start" }}>
              {copy.description}
            </th>
            <th className={`text-center py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              {copy.qty}
            </th>
            <th className={`text-center py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              {copy.price}
            </th>
            <th className={`text-center py-3 ${labelClass}`} style={{ paddingLeft: cellPad, paddingRight: cellPad, fontSize: style.labelFontSize, color: style.mutedColor }}>
              {copy.amount}
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
                  textAlign: "start",
                }}
              >
                {item.title || copy.itemPlaceholder}
              </td>
              <td
                className="text-center py-4"
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
                className="text-center py-4"
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
                className="text-center py-4 font-medium"
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
            <span>{copy.subtotal}</span>
            <span>
              {money(subtotal)} {data.currency}
            </span>
          </div>
          {data.tax > 0 && (
            <div className="flex justify-between text-sm" style={{ color: style.mutedColor, fontSize: style.bodyFontSize }}>
              <span>
                {copy.tax} ({data.tax}%)
              </span>
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
            <span>{copy.total}</span>
            <span>
              {money(total)} {data.currency}
            </span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="mt-10 pt-6 text-sm" style={{ borderTopWidth: 1, borderTopColor: style.borderColor, borderTopStyle: "solid", color: style.mutedColor, fontSize: style.bodyFontSize }}>
          <p className="font-semibold mb-2" style={{ color: style.textColor }}>{copy.notes}</p>
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
              {payment?.vodafoneCashNumber && <div>{copy.vodafoneCash}: {payment.vodafoneCashNumber}</div>}
            </div>
            {payment?.instapayUrl && (
              <a
                href={payment.instapayUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: style.accentColor }}
              >
                {copy.payWithInstapay}
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
