import { createClient } from '@/lib/supabase/server';
import {
    DollarSign,
    FileCheck,
    Users,
    AlertCircle,
    FileText
} from 'lucide-react';
import Link from 'next/link';

const REQUISITION_STATUS_STYLES = {
    approved: {
        dot: 'bg-green-500',
        badge: 'bg-green-100 text-green-700'
    },
    submitted: {
        dot: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-700'
    },
    default: {
        dot: 'bg-gray-400',
        badge: 'bg-slate-100 text-slate-600'
    }
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const stats = [
        { id: 'pending', label: 'Pending Requisitions', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', query: supabase.from('requisitions').select('*', { count: 'exact', head: true }).eq('status', 'submitted') },
        { id: 'active', label: 'Active Employees', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', query: supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active') },
        { id: 'missions', label: 'Mission Reports', query: supabase.from('missions_reports').select('*', { count: 'exact', head: true }).eq('status', 'approved') },
        { id: 'move', label: 'Move Reports', query: supabase.from('move_reports').select('*', { count: 'exact', head: true }).eq('status', 'approved') },
        { id: 'dept', label: 'Dept Reports', query: supabase.from('department_reports').select('*', { count: 'exact', head: true }).eq('status', 'approved') },
        { id: 'disbursed', label: 'Total Disbursed', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100', query: supabase.from('requisitions').select('amount').eq('status', 'approved') },
    ];

    let dashboardData = {
        pendingRequisitions: 0,
        activeEmployees: 0,
        approvedReportsCount: 0,
        totalDisbursed: 0,
        recentRequisitions: []
    };

    try {
        const [
            { count: pendingCount },
            { count: employeesCount },
            { count: missionCount },
            { count: moveCount },
            { count: deptCount },
            { data: disbursedData },
            { data: recentReqs }
        ] = await Promise.all([
            stats[0].query,
            stats[1].query,
            stats[2].query,
            stats[3].query,
            stats[4].query,
            stats[5].query,
            supabase.from('requisitions').select('id, title, status, created_at, profiles:created_by (full_name)').order('created_at', { ascending: false }).limit(5)
        ]);

        dashboardData = {
            pendingRequisitions: pendingCount || 0,
            activeEmployees: employeesCount || 0,
            approvedReportsCount: (missionCount || 0) + (moveCount || 0) + (deptCount || 0),
            totalDisbursed: disbursedData?.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0) || 0,
            recentRequisitions: recentReqs || []
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }

    const displayStats = [
        { label: 'Pending Requisitions', value: dashboardData.pendingRequisitions.toString(), icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Active Employees', value: dashboardData.activeEmployees.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Approved Reports', value: dashboardData.approvedReportsCount.toString(), icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Disbursed', value: `GHS ${dashboardData.totalDisbursed.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayStats.map((stat) => (
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
                        {(!dashboardData.recentRequisitions || dashboardData.recentRequisitions.length === 0) ? (
                            <p className="text-sm text-slate-500 text-center py-4">No recent requisitions</p>
                        ) : (
                            dashboardData.recentRequisitions.map((req) => (
                                <div key={req.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className={`h-2 w-2 mt-2 rounded-full ${REQUISITION_STATUS_STYLES[req.status]?.dot || REQUISITION_STATUS_STYLES.default.dot}`} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{req.title}</p>
                                            <p className="text-xs text-slate-500">{new Date(req.created_at).toLocaleDateString()} by {req.profiles?.full_name || 'Staff'}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${REQUISITION_STATUS_STYLES[req.status]?.badge || REQUISITION_STATUS_STYLES.default.badge}`}>
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
