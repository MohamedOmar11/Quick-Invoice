function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function renderInvoiceHtml({ theme, tokens, invoice, payment }) {
  const t = tokens || {};
  const inv = invoice || {};
  const items = Array.isArray(inv.items) ? inv.items : [];

  const subtotal = items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.price || 0), 0);
  const taxAmount = subtotal * (Number(inv.tax || 0) / 100);
  const total = subtotal + taxAmount;

  const fontStack =
    t.fontFamily === "mono"
      ? "ui-monospace"
      : t.fontFamily === "serif"
      ? "ui-serif"
      : "ui-sans-serif";

  const cssVars = Object.entries(t)
    .map(([k, v]) => `--${k}: ${String(v)};`)
    .join("\n");

  const dir = theme?.direction === "rtl" ? "rtl" : "ltr";
  const variant = escapeHtml(theme?.layoutVariant || "grid");

  return `<!doctype html>
<html lang="en" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice ${escapeHtml(inv.invoiceNumber || "")}</title>
    <style>
      :root {
--fontStack: ${fontStack};
${cssVars}
      }

      @page { size: A4; margin: 16mm; }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: var(--textColor, #111);
        background: var(--backgroundColor, #fff);
        font-family: var(--fontStack, ui-sans-serif), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        font-size: 12px;
      }

      .invoice {
        border: 1px solid var(--borderColor, #e5e7eb);
        border-radius: ${Number(t.borderRadius || 0)}px;
        padding: 18px;
        position: relative;
        overflow: visible;
      }

      .variant-grid {}
      .variant-fast { border: 0; padding: 0; }
      .variant-fast .invoice-inner { padding: 0; }
      .variant-stripe { padding-inline-start: 44px; }
      .variant-stripe,
      .variant-blueprint { overflow: hidden; }
      .variant-stripe::before {
        content: "";
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        width: 22px;
        background: var(--accentColor, #111);
      }
      .variant-cards { border: 0; }
      .variant-cards .card {
        border: 1px solid var(--borderColor, #e5e7eb);
        border-radius: ${Number(t.borderRadius || 14)}px;
        padding: 14px;
        background: var(--tableHeaderBg, #f9fafb);
      }
      .variant-luxury { border: 0; }
      .variant-luxury .row { justify-content: center; text-align: center; }
      .variant-luxury .meta { justify-content: space-between; text-align: start; }
      .variant-ledger { border-color: var(--borderColor, #000); }
      .variant-ledger th, .variant-ledger td { border-bottom-color: var(--borderColor, #000); }
      .variant-ledger table { border: 1px solid var(--borderColor, #000); }
      .variant-ledger th { border-bottom: 2px solid var(--borderColor, #000); }
      .variant-blueprint::before,
      .variant-blueprint::after {
        content: "";
        position: absolute;
        inset: 10px;
        border: 1px solid var(--borderColor, #cbd5e1);
        pointer-events: none;
      }
      .variant-compact { padding: 12px; }
      .variant-arabic-diwan .title { letter-spacing: -0.02em; }
      .variant-arabic-modern .title { letter-spacing: -0.02em; }

      .row { display: flex; justify-content: space-between; gap: 16px; }
      .muted { color: var(--mutedColor, #6b7280); }
      .title { font-size: ${Number(t.titleFontSize || 32)}px; font-weight: ${Number(t.headingWeight || 700)}; color: var(--accentColor, #111); margin: 0; }
      .label { font-size: ${Number(t.labelFontSize || 10)}px; font-weight: 700; letter-spacing: 0.06em; text-transform: ${t.uppercaseLabels === false ? "none" : "uppercase"}; }
      .section { margin-top: 18px; }
      .divider { border-top: 1px solid var(--borderColor, #e5e7eb); margin-top: 14px; padding-top: 14px; }
      .invoice-inner { padding: 18px; }
      .variant-fast .invoice-inner { padding: 0; }

      table { width: 100%; border-collapse: collapse; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      th, td { padding: 10px; }
      th { background: var(--tableHeaderBg, #f9fafb); border-bottom: 1px solid var(--borderColor, #e5e7eb); text-align: start; }
      td { border-bottom: 1px solid var(--borderColor, #e5e7eb); }
      .num { text-align: end; white-space: nowrap; }
      .keep-together { break-inside: avoid; page-break-inside: avoid; }
      .meta,
      .divider { break-inside: avoid; page-break-inside: avoid; }
      tr { break-inside: avoid; page-break-inside: avoid; }

      @media print {
        .invoice {
          box-shadow: none;
          overflow: visible;
          border-radius: 0;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }
        html, body { background: #fff; }
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  </head>
  <body>
    <div class="invoice variant-${variant}">
      <div class="invoice-inner">
      <div class="row ${variant === "luxury" ? "" : ""}">
        <div>
          <div class="label muted">Invoice</div>
          <h1 class="title">INVOICE</h1>
          <div class="muted">#${escapeHtml(inv.invoiceNumber || "")}</div>
        </div>
        <div style="text-align: end;">
          <div style="font-weight: 700;">Your Company</div>
        </div>
      </div>

      <div class="row divider meta ${variant === "cards" ? "card" : ""}">
        <div style="flex: 1;">
          <div class="label muted">Bill To</div>
          <div style="font-weight: 700; font-size: 16px;">${escapeHtml(inv.clientName || "")}</div>
          ${inv.clientEmail ? `<div class="muted">${escapeHtml(inv.clientEmail)}</div>` : ""}
        </div>
        <div style="min-width: 220px; text-align: end;">
          <div>
            <div class="label muted">Issue Date</div>
            <div>${escapeHtml(inv.issueDate || "")}</div>
          </div>
          <div style="margin-top: 10px;">
            <div class="label muted">Due Date</div>
            <div>${escapeHtml(inv.dueDate || "")}</div>
          </div>
        </div>
      </div>

      <div class="section ${variant === "cards" ? "card" : ""}">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="num">Qty</th>
              <th class="num">Price</th>
              <th class="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((it) => {
                const qty = Number(it.quantity || 0);
                const price = Number(it.price || 0);
                const amount = qty * price;
                return `<tr>
                  <td>${escapeHtml(it.title || "")}</td>
                  <td class="num">${escapeHtml(qty)}</td>
                  <td class="num">${money(price)}</td>
                  <td class="num">${money(amount)}</td>
                </tr>`;
              })
              .join("\n")}
          </tbody>
        </table>
      </div>

      <div class="row keep-together ${variant === "cards" ? "card" : ""}" style="margin-top: 18px; justify-content: end;">
        <div style="width: 280px;">
          <div class="row muted" style="justify-content: space-between;">
            <div>Subtotal</div>
            <div>${money(subtotal)} ${escapeHtml(inv.currency || "")}</div>
          </div>
          ${
            Number(inv.tax || 0) > 0
              ? `<div class="row muted" style="justify-content: space-between; margin-top: 8px;">
                   <div>Tax (${escapeHtml(inv.tax)}%)</div>
                   <div>${money(taxAmount)} ${escapeHtml(inv.currency || "")}</div>
                 </div>`
              : ""
          }
          <div class="row" style="justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--borderColor, #e5e7eb); font-weight: 800;">
            <div>Total</div>
            <div>${money(total)} ${escapeHtml(inv.currency || "")}</div>
          </div>
        </div>
      </div>

      ${
        inv.notes
          ? `<div class="section divider">
               <div style="font-weight: 700; margin-bottom: 6px;">Notes</div>
               <div class="muted" style="white-space: pre-wrap;">${escapeHtml(inv.notes)}</div>
             </div>`
          : ""
      }

      ${
        payment?.instapayUrl || payment?.vodafoneCashNumber
          ? `<div class="section divider">
               ${payment?.vodafoneCashNumber ? `<div class="muted">Vodafone Cash: ${escapeHtml(payment.vodafoneCashNumber)}</div>` : ""}
               ${
                 payment?.instapayUrl
                   ? `<div style="margin-top: 8px;">
                        <a href="${escapeHtml(payment.instapayUrl)}" style="color: var(--accentColor, #111); text-decoration: underline;">Pay with InstaPay</a>
                      </div>`
                   : ""
               }
             </div>`
          : ""
      }
      </div>
    </div>
  </body>
</html>`;
}

module.exports = { renderInvoiceHtml };
