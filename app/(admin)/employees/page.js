import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, Calendar, Briefcase, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function EmployeesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profiles and employee details
    // RLS will automatically filter if not admin
    const { data: employees, error } = await supabase
        .from('profiles')
        .select(`
      id,
      full_name,
      role,
      employees (
        position,
        status,
        date_joined
      ),
      departments (name)
    `)
        .order('full_name');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Employees & Staff</h2>
                    <p className="text-sm text-slate-500">Directory of all church personnel</p>
                </div>
                <Link href="/employees/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Employee
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(!employees || employees.length === 0) ? (
                    <p className="text-center text-slate-500 col-span-full">No employee records found.</p>
                ) : (
                    employees.map((member) => (
                        <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                        {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base text-slate-900">{member.full_name}</CardTitle>
                                        <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 border-slate-300">
                                            {member.role?.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                                            {member.departments?.name || 'Unassigned'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Position</p>
                                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                            {member.employees?.[0]?.position || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                                        <Badge variant={member.employees?.[0]?.status === 'active' ? 'success' : 'secondary'} className="h-5">
                                            {member.employees?.[0]?.status || 'active'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p>
                                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                            {member.employees?.[0]?.date_joined ? new Date(member.employees[0].date_joined).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {member.id === user.id && (
                                    <div className="mt-2 pt-4 border-t border-slate-100">
                                        <Link href="/profile">
                                            <Button variant="outline" size="sm" className="w-full text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50">
                                                Edit My Profile
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
