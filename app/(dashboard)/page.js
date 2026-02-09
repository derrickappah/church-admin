import { createClient } from '@/lib/supabase/server';
import { 
  DollarSign, 
  FileCheck, 
  Users, 
  AlertCircle 
} from 'lucide-react';

// Mock data until DB is connected
const stats = [
  { label: 'Pending Requisitions', value: '12', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Active Employees', value: '48', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Approved Reports', value: '156', icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Total Disbursed', value: '$24,500', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
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
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">New Requisition #102{i} Submitted</p>
                  <p className="text-xs text-slate-500">2 hours ago by John Doe</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 hover:border-blue-200">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">New Requisition</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 hover:border-blue-200">
              <FileCheck className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Submit Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
