import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Search, Receipt, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function WithdrawalsPage() {
    const supabase = await createClient();

    const { data: forms, error } = await supabase
        .from('withdrawal_forms')
        .select(`
      *,
      requisitions (title, created_by, profiles:created_by (full_name)),
      generator:generated_by (full_name)
    `)
        .order('generated_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Receipt className="h-6 w-6 text-blue-600" />
                        Withdrawal Forms
                    </h2>
                    <p className="text-sm text-slate-500">Official proof of approved financial disbursements</p>
                </div>
                <Link href="/withdrawals/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Withdrawal
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Ref Number</th>
                                    <th className="px-6 py-4">Requisition</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Issued By</th>
                                    <th className="px-6 py-4">Date Issued</th>
                                    <th className="px-6 py-4 text-right">Document</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!forms || forms.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                                            No withdrawal forms generated yet. Requisitions must be approved first.
                                        </td>
                                    </tr>
                                ) : (
                                    forms.map((form) => (
                                        <tr key={form.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-900 font-mono tracking-tighter">{form.reference_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{form.requisitions?.title}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase">Req ID: {form.requisition_id.slice(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-base">GHS {parseFloat(form.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{form.generator?.full_name || 'System'}</td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(form.generated_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`/api/withdrawals/${form.id}/pdf`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold">
                                                        <FileDown className="mr-2 h-4 w-4" />
                                                        GET PDF
                                                    </Button>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
