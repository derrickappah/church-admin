import { createClient } from '@/lib/supabase/server';
import {
    DollarSign,
    FileCheck,
    Users,
    AlertCircle,
    FileText
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch stats (same as before but updated for new schema if needed)
    const { count: pendingRequisitions } = await supabase
        .from('requisitions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

    const { count: activeEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: missionReports } = await supabase
        .from('missions_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const { count: moveReports } = await supabase
        .from('move_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const { count: deptReports } = await supabase
        .from('department_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const approvedReportsCount = (missionReports || 0) + (moveReports || 0) + (deptReports || 0);

    const { data: approvedRequisitions } = await supabase
        .from('requisitions')
        .select('amount')
        .eq('status', 'approved');

    const totalDisbursed = approvedRequisitions?.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0) || 0;

    const { data: recentRequisitions } = await supabase
        .from('requisitions')
        .select(`
      id,
      title,
      status,
      created_at,
      profiles:created_by (
        full_name
      )
    `)
        .order('created_at', { ascending: false })
        .limit(5);

    const stats = [
        { label: 'Pending Requisitions', value: pendingRequisitions?.toString() || '0', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Active Employees', value: activeEmployees?.toString() || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Approved Reports', value: approvedReportsCount.toString(), icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Disbursed', value: `GHS ${totalDisbursed.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                            <div className={`rounded-lg p-3 ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Requisitions</h3>
                        <Link href="/requisitions" className="text-sm text-blue-600 hover:underline">View all</Link>
                    </div>
                    <div className="mt-4 space-y-4">
                        {(!recentRequisitions || recentRequisitions.length === 0) ? (
                            <p className="text-sm text-slate-500 text-center py-4">No recent requisitions</p>
                        ) : (
                            recentRequisitions.map((req) => (
                                <div key={req.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className={`h-2 w-2 mt-2 rounded-full ${req.status === 'approved' ? 'bg-green-500' : req.status === 'submitted' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{req.title}</p>
                                            <p className="text-xs text-slate-500">{new Date(req.created_at).toLocaleDateString()} by {req.profiles?.full_name || 'Staff'}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        req.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/requisitions/create" className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 p-6 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                            <div className="rounded-full bg-blue-100 p-3 group-hover:bg-blue-200 transition-colors">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">New Requisition</span>
                        </Link>
                        <Link href="/reports/missions/create" className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 p-6 hover:bg-green-50 hover:border-green-200 transition-all group">
                            <div className="rounded-full bg-green-100 p-3 group-hover:bg-green-200 transition-colors">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">Submit Report</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
