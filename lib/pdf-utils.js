import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#fff', fontFamily: 'Helvetica' },
    header: { marginBottom: 40, borderBottomWidth: 2, borderBottomColor: '#1e3a8a', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    churchName: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
    documentTitle: { fontSize: 14, textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' },
    section: { marginBottom: 20 },
    label: { fontSize: 10, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4, fontWeight: 'bold' },
    value: { fontSize: 14, color: '#0f172a', marginBottom: 10 },
    amountBox: { marginTop: 20, padding: 20, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    amountLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    amountValue: { fontSize: 32, fontWeight: 'bold', color: '#1e3a8a' },
    footer: { marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' },
    signatureLine: { width: '40%', borderTopWidth: 1, borderTopColor: '#94a3b8', paddingTop: 8, alignItems: 'center' },
    signatureText: { fontSize: 10, color: '#475569' }
});

const WithdrawalPDF = ({ form }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.churchName}>Church Admin System</Text>
                <Text style={styles.documentTitle}>Withdrawal Voucher</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Reference Number</Text>
                <Text style={styles.value}>{form.reference_number}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Date Generated</Text>
                <Text style={styles.value}>{new Date(form.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Requisition Subject</Text>
                <Text style={styles.value}>{form.requisitions?.title}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Requested By</Text>
                <Text style={styles.value}>{form.requisitions?.profiles?.full_name}</Text>
            </View>

            <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Total Amount Approved</Text>
                <Text style={styles.amountValue}>GHS {parseFloat(form.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.signatureLine}>
                    <Text style={styles.signatureText}>Authorized Signatory</Text>
                    <Text style={[styles.signatureText, { marginTop: 4, fontWeight: 'bold' }]}>{form.generator?.full_name}</Text>
                </View>
                <View style={styles.signatureLine}>
                    <Text style={styles.signatureText}>Recipient Signature</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export async function generateWithdrawalPDFBuffer(form) {
    return await renderToBuffer(<WithdrawalPDF form={form} />);
}
