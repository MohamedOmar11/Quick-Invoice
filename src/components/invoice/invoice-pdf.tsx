import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 12, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 4 },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  col: { flex: 1 },
  textBold: { fontWeight: 'bold', color: '#111' },
  textSm: { fontSize: 10, color: '#666' },
  table: { width: '100%', marginTop: 20 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1, textAlign: 'right' },
  totals: { marginTop: 20, width: '40%', alignSelf: 'flex-end' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalsBorder: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 4, marginTop: 4 },
  notes: { marginTop: 40, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }
});

export const InvoicePdf = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>#{invoice.invoiceNumber}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={styles.textBold}>Your Company</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.textSm}>Bill To:</Text>
          <Text style={styles.textBold}>{invoice.clientName}</Text>
          {invoice.clientEmail && <Text>{invoice.clientEmail}</Text>}
        </View>
        <View style={{ ...styles.col, alignItems: 'flex-end' }}>
          <Text style={styles.textSm}>Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
          <Text style={styles.textSm}>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

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

      <View style={styles.totals}>
        <View style={styles.totalsRow}>
          <Text>Subtotal</Text>
          <Text>{invoice.subtotal.toFixed(2)} {invoice.currency}</Text>
        </View>
        {invoice.tax > 0 && (
          <View style={styles.totalsRow}>
            <Text>Tax ({invoice.tax}%)</Text>
            <Text>{(invoice.subtotal * (invoice.tax / 100)).toFixed(2)} {invoice.currency}</Text>
          </View>
        )}
        <View style={{ ...styles.totalsRow, ...styles.totalsBorder }}>
          <Text style={styles.textBold}>Total</Text>
          <Text style={styles.textBold}>{invoice.total.toFixed(2)} {invoice.currency}</Text>
        </View>
      </View>

      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.textBold}>Notes:</Text>
          <Text>{invoice.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);
