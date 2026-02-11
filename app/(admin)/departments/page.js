import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Trash2 } from 'lucide-react';
import { createDepartment, deleteDepartment } from './actions';
import { redirect } from 'next/navigation';

export default async function DepartmentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = ['president', 'manager', 'it_staff'].includes(profile?.role);

    if (!isAdmin) {
        return <div className="p-8 text-center text-slate-500">Access Denied</div>;
    }

    const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
                    <p className="text-sm text-slate-500">Manage organizational departments and units</p>
                    <div className="mt-2">
                        <Badge variant="outline" className="text-[10px] uppercase">
                            Admin Role: {profile?.role}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Create Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createDepartment} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g. Finance, Missions, Youth"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Department
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Existing Departments</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-slate-900">Name</th>
                                        <th className="px-6 py-3 font-semibold text-slate-900 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {departments?.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="px-6 py-8 text-center text-slate-500 italic">
                                                No departments created yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        departments?.map((dept) => (
                                            <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-700">
                                                    <Building2 className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                    {dept.name}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <form action={deleteDepartment.bind(null, dept.id)} className="inline">
                                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
