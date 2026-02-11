import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createRequisition } from '../actions';
import { createClient } from '@/lib/supabase/server';

export default async function NewRequisitionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch account codes or categories if needed
    const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/requisitions">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">New Requisition</h2>
                    <p className="text-sm text-slate-500">Create a new financial request</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requisition Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createRequisition} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Title / Purpose</label>
                                <input
                                    name="title"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g. Office Supplies for March"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Amount (GHS)</label>
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Department</label>
                                <select
                                    name="department_id"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    {departments?.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">Description / Justification</label>
                                <textarea
                                    name="purpose"
                                    required
                                    rows="4"
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Please provide details about this requisition..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link href="/requisitions">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit">Submit Requisition</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
