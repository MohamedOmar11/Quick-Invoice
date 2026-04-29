import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { coerceInvoiceThemeId, type InvoiceThemeId } from "@/components/invoice/invoice-themes";

function getThemeTokens(themeId: InvoiceThemeId) {
  const tokens: Record<
    InvoiceThemeId,
    {
      fontFamily: "Helvetica" | "Times-Roman" | "Courier";
      text: string;
      muted: string;
      accent: string;
      border: string;
      headerBg?: string;
      headerText?: string;
      padding: number;
    }
  > = {
    minimal: { fontFamily: "Helvetica", text: "#111", muted: "#666", accent: "#111", border: "#e5e7eb", padding: 40 },
    "classic-ledger": { fontFamily: "Times-Roman", text: "#111", muted: "#444", accent: "#111", border: "#111827", padding: 40 },
    "modern-stripe": { fontFamily: "Helvetica", text: "#111", muted: "#6b7280", accent: "#4f46e5", border: "#c7d2fe", padding: 40 },
    "elegant-serif": { fontFamily: "Times-Roman", text: "#111", muted: "#6b7280", accent: "#111", border: "#e5e7eb", padding: 46 },
    "mono-pro": { fontFamily: "Courier", text: "#111", muted: "#6b7280", accent: "#111", border: "#e5e7eb", padding: 40 },
    "corner-stamp": { fontFamily: "Helvetica", text: "#111", muted: "#6b7280", accent: "#111", border: "#e5e7eb", padding: 40 },
    "soft-pastel": { fontFamily: "Helvetica", text: "#111", muted: "#6b7280", accent: "#be123c", border: "#fecdd3", padding: 40 },
    "dark-header": { fontFamily: "Helvetica", text: "#111", muted: "#6b7280", accent: "#111", border: "#111827", headerBg: "#0b0f19", headerText: "#ffffff", padding: 0 },
    "split-panel": { fontFamily: "Helvetica", text: "#111", muted: "#6b7280", accent: "#111", border: "#e5e7eb", padding: 0 },
    "compact-pro": { fontFamily: "Helvetica", text: "#111", muted: "#6b7280", accent: "#111", border: "#e5e7eb", padding: 30 },
  };

  return tokens[themeId];
}

function getStyles(themeId: InvoiceThemeId) {
  const t = getThemeTokens(themeId);
  const base = StyleSheet.create({
    page: { padding: t.padding, fontFamily: t.fontFamily, fontSize: 12, color: t.text },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 34 },
    headerPadded: { padding: 40 },
    headerBox: { backgroundColor: t.headerBg, color: t.headerText },
    title: { fontSize: 24, fontWeight: 700, color: t.headerText ?? t.accent },
    subtitle: { fontSize: 10, color: t.headerText ? "rgba(255,255,255,0.7)" : t.muted, marginTop: 4 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    col: { flex: 1 },
    textBold: { fontWeight: 700, color: t.headerText ?? t.text },
    textSm: { fontSize: 10, color: t.headerText ? "rgba(255,255,255,0.7)" : t.muted },
    table: { width: "100%", marginTop: 18 },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: themeId === "classic-ledger" ? 2 : 1,
      borderBottomColor: themeId === "classic-ledger" ? t.border : "#e5e7eb",
      paddingBottom: 6,
      marginBottom: 6,
      color: t.muted,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: themeId === "compact-pro" ? 4 : 6,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
    },
    colDesc: { flex: 3 },
    colQty: { flex: 1, textAlign: "right" },
    colPrice: { flex: 1, textAlign: "right" },
    colAmount: { flex: 1, textAlign: "right" },
    totals: { marginTop: 18, width: "45%", alignSelf: "flex-end" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    totalsBorder: { borderTopWidth: themeId === "classic-ledger" ? 2 : 1, borderTopColor: t.border, paddingTop: 6, marginTop: 6 },
    notes: { marginTop: 34, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    stamp: {
      position: "absolute",
      top: 28,
      right: 28,
      transform: "rotate(12deg)",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      paddingVertical: 6,
      paddingHorizontal: 10,
      fontSize: 10,
      color: "#9ca3af",
      letterSpacing: 2,
    },
    splitWrap: { flexDirection: "row", width: "100%", height: "100%" },
    splitLeft: { width: 200, backgroundColor: "#f9fafb", padding: 28, borderRightWidth: 1, borderRightColor: "#e5e7eb" },
    splitRight: { flex: 1, padding: 28 },
    label: { fontSize: 10, color: t.muted, marginBottom: 4 },
    big: { fontSize: 18, fontWeight: 700, color: t.text },
  });

  return base;
}

export const InvoicePdf = ({ invoice }: { invoice: any }) => {
  const themeId = coerceInvoiceThemeId(invoice?.template);
  const styles = getStyles(themeId);

  const headerInner = (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>INVOICE</Text>
        <Text style={styles.subtitle}>#{invoice.invoiceNumber}</Text>
      </View>
      <View style={{ textAlign: "right" }}>
        <Text style={styles.textBold}>Your Company</Text>
      </View>
    </View>
  );

  const header =
    themeId === "dark-header" ? (
      <View style={[styles.headerBox, styles.headerPadded]}>{headerInner}</View>
    ) : (
      headerInner
    );

  const meta = (
    <View style={styles.row}>
      <View style={styles.col}>
        <Text style={styles.textSm}>Bill To:</Text>
        <Text style={styles.textBold}>{invoice.clientName}</Text>
        {invoice.clientEmail && <Text>{invoice.clientEmail}</Text>}
      </View>
      <View style={{ ...styles.col, alignItems: "flex-end" }}>
        <Text style={styles.textSm}>Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
        <Text style={styles.textSm}>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const table = (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.colDesc}>Description</Text>
        <Text style={styles.colQty}>Qty</Text>
        <Text style={styles.colPrice}>Price</Text>
        <Text style={styles.colAmount}>Amount</Text>
      </View>
      {invoice.items.map((item: any, i: number) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.colDesc}>{item.title}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          <Text style={styles.colPrice}>{item.price.toFixed(2)}</Text>
          <Text style={styles.colAmount}>{(item.quantity * item.price).toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );

  const totals = (
    <View style={styles.totals}>
      <View style={styles.totalsRow}>
        <Text>Subtotal</Text>
        <Text>
          {invoice.subtotal.toFixed(2)} {invoice.currency}
        </Text>
      </View>
      {invoice.tax > 0 && (
        <View style={styles.totalsRow}>
          <Text>Tax ({invoice.tax}%)</Text>
          <Text>
            {(invoice.subtotal * (invoice.tax / 100)).toFixed(2)} {invoice.currency}
          </Text>
        </View>
      )}
      <View style={{ ...styles.totalsRow, ...styles.totalsBorder }}>
        <Text style={styles.textBold}>Total</Text>
        <Text style={styles.textBold}>
          {invoice.total.toFixed(2)} {invoice.currency}
        </Text>
      </View>
    </View>
  );

  const notes =
    invoice.notes ? (
      <View style={styles.notes}>
        <Text style={styles.textBold}>Notes:</Text>
        <Text>{invoice.notes}</Text>
      </View>
    ) : null;

  const content =
    themeId === "split-panel" ? (
      <View style={styles.splitWrap}>
        <View style={styles.splitLeft}>
          <Text style={styles.label}>Invoice</Text>
          <Text style={styles.big}>#{invoice.invoiceNumber}</Text>
          <View style={{ marginTop: 18 }}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.textBold}>{invoice.clientName}</Text>
            {invoice.clientEmail && <Text>{invoice.clientEmail}</Text>}
          </View>
          <View style={{ marginTop: 18 }}>
            <Text style={styles.label}>Issue Date</Text>
            <Text>{new Date(invoice.issueDate).toLocaleDateString()}</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Due Date</Text>
            <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={{ marginTop: 18 }}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.big}>
              {invoice.total.toFixed(2)} {invoice.currency}
            </Text>
          </View>
        </View>
        <View style={styles.splitRight}>
          {headerInner}
          {table}
          {totals}
          {notes}
        </View>
      </View>
    ) : (
      <>
        {header}
        {meta}
        {table}
        {totals}
        {notes}
        {themeId === "corner-stamp" && <Text style={styles.stamp}>DRAFT</Text>}
      </>
    );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {content}
      </Page>
    </Document>
  );
};
