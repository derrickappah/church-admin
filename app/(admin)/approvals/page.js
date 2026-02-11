import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, FileText, DollarSign, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function ApprovalsPage() {
    const supabase = await createClient();

    // Fetch pending items from all tables
    const { data: requisitions } = await supabase
        .from('requisitions')
        .select('*, profiles:created_by (full_name)')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

    const { data: missions } = await supabase
        .from('missions_reports')
        .select('*, profiles:created_by (full_name)')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

    const { data: moves } = await supabase
        .from('move_reports')
        .select('*, profiles:created_by (full_name)')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

    const { data: departments } = await supabase
        .from('department_reports')
        .select('*, profiles:created_by (full_name), departments (name)')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });

    const totalPending = (requisitions?.length || 0) + (missions?.length || 0) + (moves?.length || 0) + (departments?.length || 0);

    const ApprovalTable = ({ items, type, hrefPrefix }) => (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4">Submitted By</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {(!items || items.length === 0) ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">No pending {type}s.</td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{item.title || item.departments?.name || `${type} Report`}</span>
                                        {item.amount && <span className="text-blue-600 font-medium font-mono text-xs">GHS {parseFloat(item.amount).toLocaleString()}</span>}
                                        {item.month && <span className="text-slate-400 text-xs">{item.month}/{item.year}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{item.profiles?.full_name}</td>
                                <td className="px-6 py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`${hrefPrefix}/${item.id}`}>
                                        <Button size="sm" variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50">
                                            Review <ArrowUpRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                        Approvals Queue
                    </h2>
                    <p className="text-sm text-slate-500">Review and authorize pending requests and reports</p>
                </div>
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full flex items-center gap-2 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    {totalPending} Pending Items
                </div>
            </div>

            <Tabs defaultValue="requisitions" className="w-full">
                <TabsList className="bg-slate-100 p-1 w-full justify-start mb-6 h-12">
                    <TabsTrigger value="requisitions" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-900 h-10">
                        Requisitions ({requisitions?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-900 h-10">
                        Reports ({totalPending - (requisitions?.length || 0)})
                    </TabsTrigger>
                </TabsList>

                <Card className="border-slate-200">
                    <TabsContent value="requisitions" className="m-0">
                        <ApprovalTable items={requisitions} type="Requisition" hrefPrefix="/requisitions" />
                    </TabsContent>
                    <TabsContent value="reports" className="m-0 space-y-8 p-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Mission Reports</h4>
                            <ApprovalTable items={missions} type="Mission" hrefPrefix="/reports/missions" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Move Reports</h4>
                            <ApprovalTable items={moves} type="Move" hrefPrefix="/reports/move" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Department Summaries</h4>
                            <ApprovalTable items={departments} type="Department" hrefPrefix="/reports/departments" />
                        </div>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    );
}
