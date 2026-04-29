import { Document, Link, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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
  const rowSepWidth =
    effectiveStyle.rowSeparator === "none" ? 0 : effectiveStyle.rowSeparator === "medium" ? 2 : 1;
  const cellPad =
    effectiveStyle.cellPadding === "lg" ? 12 : effectiveStyle.cellPadding === "sm" ? 6 : 10;

  const styles = StyleSheet.create({
    page: {
      padding,
      fontFamily,
      fontSize: effectiveStyle.bodyFontSize ?? effectiveStyle.baseFontSize,
      color: effectiveStyle.textColor,
      backgroundColor: effectiveStyle.backgroundColor,
    },
    wrap: {
      borderWidth,
      borderColor: effectiveStyle.borderColor,
      borderRadius: effectiveStyle.borderRadius,
      padding: 18,
      backgroundColor: effectiveStyle.backgroundColor,
    },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
    title: {
      fontSize: effectiveStyle.titleFontSize ? Math.max(18, Math.round(effectiveStyle.titleFontSize * 0.7)) : 22,
      fontWeight: effectiveStyle.headingWeight as any,
      color: effectiveStyle.accentColor,
    },
    subtitle: { fontSize: effectiveStyle.labelFontSize ?? 10, color: effectiveStyle.mutedColor, marginTop: 4 },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: effectiveStyle.borderColor,
    },
    label: {
      fontSize: effectiveStyle.labelFontSize ?? 10,
      color: effectiveStyle.mutedColor,
      marginBottom: 4,
    },
    strong: { fontWeight: effectiveStyle.headingWeight as any, color: effectiveStyle.textColor },
    table: { width: "100%", marginTop: 10, borderWidth: tableBoxed ? 1 : 0, borderColor: effectiveStyle.borderColor },
    tableHeader: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: effectiveStyle.borderColor,
      backgroundColor: tableBoxed ? effectiveStyle.tableHeaderBg : undefined,
    },
    row: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottomWidth: rowSepWidth,
      borderBottomColor: effectiveStyle.borderColor,
    },
    cellDesc: {
      flex: 3,
      paddingHorizontal: cellPad,
      borderRightWidth: effectiveStyle.showColumnBorders ? 1 : 0,
      borderRightColor: effectiveStyle.borderColor,
    },
    cell: {
      flex: 1,
      textAlign: "right",
      paddingHorizontal: cellPad,
      borderRightWidth: effectiveStyle.showColumnBorders ? 1 : 0,
      borderRightColor: effectiveStyle.borderColor,
    },
    totals: { marginTop: 14, width: "45%", alignSelf: "flex-end" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, color: effectiveStyle.mutedColor },
    totalsStrong: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 6, borderTopWidth: 1, borderTopColor: effectiveStyle.borderColor },
    notes: { marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderTopColor: effectiveStyle.borderColor },
    footer: { marginTop: 18, fontSize: effectiveStyle.labelFontSize ?? 10, color: effectiveStyle.mutedColor },
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
              <Text style={[styles.cell, { borderRightWidth: 0 }]}>Amount</Text>
            </View>
            {invoice.items.map((item: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.row,
                  effectiveStyle.zebraRows && i % 2 === 1
                    ? { backgroundColor: effectiveStyle.zebraColor }
                    : {},
                ]}
              >
                <Text style={styles.cellDesc}>{item.title}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cell}>{money(item.price)}</Text>
                <Text style={[styles.cell, { borderRightWidth: 0 }]}>{money(item.quantity * item.price)}</Text>
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

          {invoice?.user?.instapayUrl || invoice?.user?.vodafoneCashNumber ? (
            <View style={styles.footer}>
              {invoice?.user?.instapayUrl ? (
                <View style={{ marginBottom: 6 }}>
                  <Text>InstaPay:</Text>
                  <Link src={invoice.user.instapayUrl} style={{ color: effectiveStyle.accentColor }}>
                    {invoice.user.instapayUrl}
                  </Link>
                </View>
              ) : null}
              {invoice?.user?.vodafoneCashNumber ? <Text>Vodafone Cash: {invoice.user.vodafoneCashNumber}</Text> : null}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
};
