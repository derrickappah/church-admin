import React from 'react';
import { Page, Text, View, Document, StyleSheet, renderToStream } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
    paddingBottom: 5,
  },
  label: {
    width: 150,
    fontSize: 12,
    color: '#444',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center',
    color: '#888',
  },
  signatureBox: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 10,
  }
});

// Create Document Component
const WithdrawalForm = ({ id, amount, date, title, payee, department }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CHURCH WITHDRAWAL FORM</Text>
        <Text style={styles.subtitle}>Official Financial Document</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Requisition ID:</Text>
          <Text style={styles.value}>{id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>${Number(amount).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payee:</Text>
          <Text style={styles.value}>{payee}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Purpose:</Text>
          <Text style={styles.value}>{title}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <Text style={styles.value}>{department}</Text>
        </View>
      </View>

      <View style={styles.signatureBox}>
        <View>
          <Text style={styles.signature}>Requested By: {payee}</Text>
        </View>
        <View>
          <Text style={styles.signature}>Approved By (President/Manager)</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Generated automatically by Church Admin System on {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

export async function GET(req, { params }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch requisition details
  const { data: requisition, error } = await supabase
    .from('requisitions')
    .select(`
      *,
      profiles:created_by (full_name)
    `)
    .eq('id', id)
    .single();

  if (error || !requisition) {
    return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
  }

  const stream = await renderToStream(
    <WithdrawalForm 
      id={requisition.id} 
      amount={requisition.amount} 
      date={new Date(requisition.created_at).toLocaleDateString()} 
      title={requisition.title}
      payee={requisition.profiles?.full_name || 'Unknown'}
      department={requisition.department_id || 'General'}
    />
  );

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="withdrawal-${id}.pdf"`,
    },
  });
}
