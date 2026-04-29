import type { InvoiceThemeId } from "@/components/invoice/invoice-themes";

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
  data,
}: {
  themeId: InvoiceThemeId;
  data: InvoicePreviewData;
}) {
  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = subtotal * (data.tax / 100);
  const total = subtotal + taxAmount;

  const baseWrap =
    "bg-white text-black rounded-lg shadow-lg max-w-2xl mx-auto aspect-[1/1.4] relative print-ready";

  const themeWrap: Record<InvoiceThemeId, string> = {
    minimal: "p-8",
    "classic-ledger": "p-8 border-2 border-gray-800",
    "modern-stripe": "p-8 border border-gray-200",
    "elegant-serif": "p-10",
    "mono-pro": "p-8 font-mono",
    "corner-stamp": "p-8",
    "soft-pastel": "p-8 bg-rose-50",
    "dark-header": "p-0 overflow-hidden",
    "split-panel": "p-0 overflow-hidden",
    "compact-pro": "p-6 text-[13px]",
  };

  const accent: Record<InvoiceThemeId, string> = {
    minimal: "text-gray-900",
    "classic-ledger": "text-gray-950",
    "modern-stripe": "text-indigo-700",
    "elegant-serif": "text-gray-950",
    "mono-pro": "text-gray-900",
    "corner-stamp": "text-gray-950",
    "soft-pastel": "text-rose-700",
    "dark-header": "text-white",
    "split-panel": "text-gray-950",
    "compact-pro": "text-gray-950",
  };

  const titleClass =
    themeId === "elegant-serif" ? "font-serif tracking-tight" : "font-light tracking-tighter";

  const header =
    themeId === "dark-header" ? (
      <div className="bg-gray-950 text-white px-8 py-10 flex justify-between items-start">
        <div>
          <h1 className={`text-4xl ${titleClass}`}>INVOICE</h1>
          <p className="text-white/70 text-sm mt-2">#{data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center text-white/50 font-bold mb-3 ml-auto">
            LOGO
          </div>
          <div className="font-semibold">Your Company</div>
        </div>
      </div>
    ) : themeId === "modern-stripe" ? (
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="h-2 w-20 bg-indigo-600 rounded-full mb-6" />
          <h1 className={`text-4xl ${titleClass} ${accent[themeId]}`}>INVOICE</h1>
          <p className="text-gray-500 text-sm">#{data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold mb-4 ml-auto">
            LOGO
          </div>
          <h2 className="font-semibold text-gray-800">Your Company</h2>
        </div>
      </div>
    ) : (
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className={`text-4xl ${titleClass} ${accent[themeId]}`}>INVOICE</h1>
          <p className="text-gray-500 text-sm">#{data.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold mb-4 ml-auto">
            LOGO
          </div>
          <h2 className="font-semibold text-gray-800">Your Company</h2>
        </div>
      </div>
    );

  const body =
    themeId === "split-panel" ? (
      <div className="grid grid-cols-[260px_1fr] h-full">
        <div className="bg-gray-50 border-r p-8">
          <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Invoice</div>
          <div className={`text-2xl ${accent[themeId]} font-semibold`}>#{data.invoiceNumber}</div>
          <div className="mt-8">
            <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Bill To</div>
            <div className="font-semibold text-gray-800">{data.clientName || "Client Name"}</div>
            {data.clientEmail && <div className="text-gray-600 text-sm mt-1">{data.clientEmail}</div>}
          </div>
          <div className="mt-8 space-y-3 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Issue Date</div>
              <div>{data.issueDate}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-1">Due Date</div>
              <div>{data.dueDate}</div>
            </div>
          </div>
          <div className="mt-10 text-sm">
            <div className="text-xs text-gray-500 font-semibold tracking-wider uppercase mb-2">Total</div>
            <div className="text-2xl font-semibold text-gray-900">
              {money(total)} {data.currency}
            </div>
          </div>
        </div>

        <div className="p-8">
          {header}
          <ItemsTable themeId={themeId} data={data} />
          <TotalsBlock themeId={themeId} subtotal={subtotal} taxAmount={taxAmount} total={total} tax={data.tax} currency={data.currency} />
          <NotesBlock notes={data.notes} />
          <Footer />
        </div>
      </div>
    ) : (
      <>
        {header}
        <MetaRow themeId={themeId} data={data} />
        <ItemsTable themeId={themeId} data={data} />
        <TotalsBlock themeId={themeId} subtotal={subtotal} taxAmount={taxAmount} total={total} tax={data.tax} currency={data.currency} />
        <NotesBlock notes={data.notes} />
        <Footer />
        {themeId === "corner-stamp" && (
          <div className="absolute top-8 right-8 rotate-12 border-2 border-gray-200 px-3 py-2 text-xs tracking-widest uppercase text-gray-400">
            Draft
          </div>
        )}
      </>
    );

  return (
    <div className={`${baseWrap} ${themeWrap[themeId]}`}>
      {body}
    </div>
  );
}

function MetaRow({ themeId, data }: { themeId: InvoiceThemeId; data: InvoicePreviewData }) {
  const border =
    themeId === "classic-ledger"
      ? "border-b-2 border-gray-800"
      : themeId === "compact-pro"
      ? "border-b border-gray-200"
      : "border-b border-gray-100";

  return (
    <div className={`flex justify-between mb-10 pb-6 ${border}`}>
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
  );
}

function ItemsTable({ themeId, data }: { themeId: InvoiceThemeId; data: InvoicePreviewData }) {
  const headBorder =
    themeId === "classic-ledger" ? "border-b-2 border-gray-800" : "border-b border-gray-200";
  const rowBorder =
    themeId === "classic-ledger" ? "border-b border-gray-200" : "border-b border-gray-100";

  return (
    <table className="w-full mb-8">
      <thead>
        <tr className={headBorder}>
          <th className="text-left py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Description</th>
          <th className="text-right py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Qty</th>
          <th className="text-right py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Price</th>
          <th className="text-right py-3 text-xs text-gray-500 font-semibold tracking-wider uppercase">Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, i) => (
          <tr key={i} className={rowBorder}>
            <td className="py-4 text-gray-800 text-sm">{item.title || "Item description"}</td>
            <td className="text-right py-4 text-gray-600 text-sm">{item.quantity}</td>
            <td className="text-right py-4 text-gray-600 text-sm">{money(item.price)}</td>
            <td className="text-right py-4 text-gray-800 font-medium text-sm">{money(item.quantity * item.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TotalsBlock({
  themeId,
  subtotal,
  taxAmount,
  total,
  tax,
  currency,
}: {
  themeId: InvoiceThemeId;
  subtotal: number;
  taxAmount: number;
  total: number;
  tax: number;
  currency: string;
}) {
  const border =
    themeId === "classic-ledger"
      ? "border-t-2 border-gray-800"
      : themeId === "modern-stripe"
      ? "border-t-2 border-indigo-200"
      : "border-t-2 border-gray-200";

  return (
    <div className="flex justify-end mb-12">
      <div className="w-64 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>
            {money(subtotal)} {currency}
          </span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax ({tax}%)</span>
            <span>
              {money(taxAmount)} {currency}
            </span>
          </div>
        )}
        <div className={`flex justify-between font-semibold text-lg text-gray-900 pt-3 ${border}`}>
          <span>Total</span>
          <span>
            {money(total)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}

function NotesBlock({ notes }: { notes?: string }) {
  if (!notes) return null;
  return (
    <div className="mt-16 pt-8 border-t border-gray-200 text-gray-500 text-sm">
      <p className="font-semibold text-gray-700 mb-2">Notes</p>
      <p className="whitespace-pre-wrap">{notes}</p>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bottom-8 left-8 text-xs text-gray-300 font-medium tracking-widest uppercase">
      Created with QuickInvoice
    </div>
  );
}

