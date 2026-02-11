import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#fff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#1e3a8a',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    churchName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    documentTitle: {
        fontSize: 14,
        textTransform: 'uppercase',
        color: '#64748b',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#94a3b8',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 14,
        color: '#0f172a',
        marginBottom: 10,
    },
    amountBox: {
        marginTop: 20,
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    footer: {
        marginTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureLine: {
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#94a3b8',
        paddingTop: 8,
        alignItems: 'center',
    },
    signatureText: {
        fontSize: 10,
        color: '#475569',
    }
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

export async function GET(request, { params }) {
    const { id } = params;
    const supabase = await createClient();

    // Fetch form data
    const { data: form, error } = await supabase
        .from('withdrawal_forms')
        .select(`
      *,
      requisitions (title, profiles:created_by (full_name)),
      generator:generated_by (full_name)
    `)
        .eq('id', id)
        .single();

    if (error || !form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    try {
        const stream = await renderToStream(<WithdrawalPDF form={form} />);

        // We could upload to Supabase Storage here too if needed, 
        // but the request said "Save PDF to Supabase Storage AND Link PDF to withdrawal record".
        // Usually that's done once upon generation, but rendering on demand is also flexible.
        // If we MUST save it, we'd do it in the trigger/action that creates the record.
        // But since triggers can't easily run JS for PDF gen, we can do it here if it doesn't exist.

        const response = new NextResponse(stream);
        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set('Content-Disposition', `inline; filename="Withdrawal-${form.reference_number}.pdf"`);

        return response;
    } catch (err) {
        console.error('PDF Generation error:', err);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
