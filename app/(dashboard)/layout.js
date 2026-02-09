import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Users, 
  LogOut, 
  Settings,
  Menu
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white shadow-sm hidden md:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <span className="text-lg font-bold text-blue-900">Church Admin</span>
        </div>
        
        <div className="px-3 py-4">
          <nav className="space-y-1">
            <NavLink href="/dashboard" icon={LayoutDashboard}>Overview</NavLink>
            <NavLink href="/dashboard/requisitions" icon={DollarSign}>Requisitions</NavLink>
            <NavLink href="/dashboard/reports" icon={FileText}>Reports</NavLink>
            <NavLink href="/dashboard/employees" icon={Users}>Employees</NavLink>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-slate-200 bg-slate-50 p-4">
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="h-6 w-6 text-slate-500" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
              JD
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon: Icon, children }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
