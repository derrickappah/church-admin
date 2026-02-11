import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import UserTableRow from './UserTableRow';

export default async function UsersManagementPage() {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
        redirect('/login');
    }

    // Check if admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

    const isAdmin = ['president', 'manager', 'it_staff'].includes(profile?.role);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                <Shield className="h-16 w-16 text-red-500 mb-4 opacity-20" />
                <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
                <p className="text-slate-500 max-w-md text-center mt-2 px-6">
                    You do not have administrative privileges to access this area. Please contact the IT department if you believe this is an error.
                </p>
                <Link href="/dashboard" className="mt-8">
                    <Button variant="outline">Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    // Fetch all profiles and departments
    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
            *,
            departments (id, name)
        `)
        .order('full_name');

    const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

    const roles = ['president', 'manager', 'it_staff', 'department_head', 'staff'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                    <p className="text-sm text-slate-500">Manage church staff access levels and roles</p>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg">Staff Directory</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/10">
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-tight text-[10px]">User</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-tight text-[10px]">Role</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-tight text-[10px]">Department</th>
                                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-tight text-[10px]">Account Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {profiles?.map((user) => (
                                    <UserTableRow
                                        key={user.id}
                                        user={user}
                                        currentUser={currentUser}
                                        departments={departments}
                                        roles={roles}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
