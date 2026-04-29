import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { mergeInvoiceStyle } from "@/components/invoice/invoice-style";

function money(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export const InvoicePdf = ({ invoice }: { invoice: any }) => {
  const effectiveStyle = mergeInvoiceStyle(invoice?.user?.defaultInvoiceStyle, invoice?.style);

  const fontFamily =
    effectiveStyle.fontFamily === "mono"
      ? "Courier"
      : effectiveStyle.fontFamily === "serif"
      ? "Times-Roman"
      : "Helvetica";

  const padding =
    effectiveStyle.spacing === "spacious" ? 48 : effectiveStyle.spacing === "compact" ? 28 : 40;

  const borderWidth =
    effectiveStyle.borderStyle === "none"
      ? 0
      : effectiveStyle.borderStyle === "medium"
      ? 2
      : 1;

  const tableBoxed = effectiveStyle.tableStyle === "boxed";

  const styles = StyleSheet.create({
    page: {
      padding,
      fontFamily,
      fontSize: effectiveStyle.baseFontSize,
      color: "#111111",
    },
    wrap: {
      borderWidth,
      borderColor: "#e5e7eb",
      borderRadius: effectiveStyle.borderRadius,
      padding: 18,
    },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
    title: { fontSize: 22, fontWeight: effectiveStyle.headingWeight as any, color: effectiveStyle.accentColor },
    subtitle: { fontSize: 10, color: "#6b7280", marginTop: 4 },
    metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
    label: { fontSize: 10, color: "#6b7280", marginBottom: 4 },
    strong: { fontWeight: effectiveStyle.headingWeight as any, color: "#111111" },
    table: { width: "100%", marginTop: 10, borderWidth: tableBoxed ? 1 : 0, borderColor: "#e5e7eb" },
    tableHeader: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", backgroundColor: tableBoxed ? "#f9fafb" : undefined },
    row: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: tableBoxed ? "#e5e7eb" : "#f3f4f6" },
    cellDesc: { flex: 3, paddingHorizontal: tableBoxed ? 10 : 0 },
    cell: { flex: 1, textAlign: "right", paddingHorizontal: tableBoxed ? 10 : 0 },
    totals: { marginTop: 14, width: "45%", alignSelf: "flex-end" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, color: "#4b5563" },
    totalsStrong: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 6, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    notes: { marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
    footer: { marginTop: 18, fontSize: 10, color: "#9ca3af" },
  });

  const subtotal = invoice.items.reduce((acc: number, it: any) => acc + it.quantity * it.price, 0);
  const taxAmount = subtotal * (invoice.tax / 100);
  const total = subtotal + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.wrap}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.subtitle}>#{invoice.invoiceNumber}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.strong}>Your Company</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.strong}>{invoice.clientName}</Text>
              {invoice.clientEmail ? <Text>{invoice.clientEmail}</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Issue Date</Text>
              <Text>{new Date(invoice.issueDate).toLocaleDateString()}</Text>
              <Text style={[styles.label, { marginTop: 8 }]}>Due Date</Text>
              <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellDesc}>Description</Text>
              <Text style={styles.cell}>Qty</Text>
              <Text style={styles.cell}>Price</Text>
              <Text style={styles.cell}>Amount</Text>
            </View>
            {invoice.items.map((item: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.row,
                  effectiveStyle.zebraRows && i % 2 === 1 ? { backgroundColor: "#f9fafb" } : {},
                ]}
              >
                <Text style={styles.cellDesc}>{item.title}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cell}>{money(item.price)}</Text>
                <Text style={styles.cell}>{money(item.quantity * item.price)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalsRow}>
              <Text>Subtotal</Text>
              <Text>
                {money(subtotal)} {invoice.currency}
              </Text>
            </View>
            {invoice.tax > 0 ? (
              <View style={styles.totalsRow}>
                <Text>Tax ({invoice.tax}%)</Text>
                <Text>
                  {money(taxAmount)} {invoice.currency}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalsStrong}>
              <Text style={styles.strong}>Total</Text>
              <Text style={styles.strong}>
                {money(total)} {invoice.currency}
              </Text>
            </View>
          </View>

          {invoice.notes ? (
            <View style={styles.notes}>
              <Text style={styles.strong}>Notes:</Text>
              <Text>{invoice.notes}</Text>
            </View>
          ) : null}

          {invoice?.user?.instapayHandle || invoice?.user?.vodafoneCashNumber ? (
            <View style={styles.footer}>
              {invoice?.user?.instapayHandle ? <Text>InstaPay: {invoice.user.instapayHandle}</Text> : null}
              {invoice?.user?.vodafoneCashNumber ? <Text>Vodafone Cash: {invoice.user.vodafoneCashNumber}</Text> : null}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};
