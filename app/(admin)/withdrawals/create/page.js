import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createWithdrawal } from '../actions';
import { createClient } from '@/lib/supabase/server';

export default async function NewWithdrawalPage() {
    const supabase = await createClient();

    // Fetch approved requisitions for selection
    const { data: approvedRequisitions } = await supabase
        .from('requisitions')
        .select('id, title, amount')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/withdrawals">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">New Withdrawal Form</h2>
                    <p className="text-sm text-slate-500">Generate a new withdrawal proof for an approved requisition</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createWithdrawal} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">Requisition</label>
                                <select
                                    name="requisition_id"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Approved Requisition</option>
                                    {approvedRequisitions?.map(req => (
                                        <option key={req.id} value={req.id}>
                                            {req.title} (GHS {req.amount.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">Withdrawal Amount (GHS)</label>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 italic">This amount should ideally match or be less than the requisition amount.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link href="/withdrawals">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit">Generate Withdrawal Form</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
