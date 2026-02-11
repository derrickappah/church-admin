import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, FileText, Landmark, PieChart } from 'lucide-react';
import Link from 'next/link';

export default async function DepartmentReportsPage() {
    const supabase = await createClient();

    const { data: reports, error } = await supabase
        .from('department_reports')
        .select(`
      *,
      departments (name),
      profiles:created_by (full_name)
    `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Landmark className="h-6 w-6 text-blue-600" />
                        Department Reports
                    </h2>
                    <p className="text-sm text-slate-500">Monthly summaries and financial status by department</p>
                </div>
                <Link href="/reports/departments/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Summary
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {(!reports || reports.length === 0) ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                        <PieChart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No department reports yet</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} className="hover:shadow-md transition-all border-slate-200">
                            <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-blue-900">{report.departments?.name}</CardTitle>
                                        <p className="text-sm font-medium text-slate-500">{months[report.month - 1]} {report.year}</p>
                                    </div>
                                    <Badge variant={report.status === 'approved' ? 'success' : 'secondary'}>{report.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Summary</label>
                                    <p className="text-sm text-slate-600 line-clamp-2 italic">"{report.summary}"</p>
                                </div>

                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                    <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 block">Financial Summary</label>
                                    <p className="text-sm text-slate-700 font-medium">{report.financial_summary}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-xs text-slate-500">Submitted by {report.profiles?.full_name}</span>
                                    <Link href={`/reports/departments/${report.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700">View Full Report</Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
