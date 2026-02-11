import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, FileText, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function MissionsReportsPage() {
    const supabase = await createClient();

    const { data: reports, error } = await supabase
        .from('missions_reports')
        .select(`
      *,
      profiles:created_by (full_name)
    `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 text-blue-900">Missions Reports</h2>
                    <p className="text-sm text-slate-500 font-medium">Tracking outreach and mission activities</p>
                </div>
                <Link href="/reports/missions/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        New Report
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(!reports || reports.length === 0) ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                        <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No missions reports yet</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <Card key={report.id} className="hover:shadow-md transition-all border-slate-200 group">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                <Badge variant={
                                    report.status === 'approved' ? 'success' :
                                        report.status === 'rejected' ? 'destructive' : 'secondary'
                                } className="h-6">
                                    {report.status}
                                </Badge>
                                <span className="text-xs font-bold text-slate-400 font-mono">#{report.id.slice(0, 6)}</span>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {months[report.month - 1]} {report.year}
                                    </h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                        <Calendar className="h-3 w-3" />
                                        Submitted on {new Date(report.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                    "{report.content?.slice(0, 150)}..."
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-xs text-slate-500 font-medium">By {report.profiles?.full_name}</span>
                                    <Link href={`/reports/missions/${report.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                                        View Details
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
