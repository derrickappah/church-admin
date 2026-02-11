import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createEmployee } from '../actions';
import { createClient } from '@/lib/supabase/server';

export default async function NewEmployeePage() {
    const supabase = await createClient();

    // Fetch roles and departments for dropdowns
    const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/employees">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">New Employee</h2>
                    <p className="text-sm text-slate-500">Register a new church staff member</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Staff Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createEmployee} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    name="full_name"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    name="role"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="president">President</option>
                                    <option value="it_staff">IT Staff</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Department</label>
                                <select
                                    name="department_id"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    {departments?.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Position</label>
                                <input
                                    name="position"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g. Accounts Clerk"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date Joined</label>
                                <input
                                    name="date_joined"
                                    type="date"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link href="/employees">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit">Create Employee Record</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
