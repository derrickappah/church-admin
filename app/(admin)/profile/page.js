import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Briefcase, Mail } from 'lucide-react';
import Link from 'next/link';
import { updateProfile } from './actions';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch profile and employee data
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            full_name,
            role,
            employees (position),
            departments (name)
        `)
        .eq('id', user.id)
        .single();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/employees">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Directory
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Edit My Profile</h2>
                    <p className="text-sm text-slate-500">Update your personal and professional information</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl mb-4">
                            {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                        </div>
                        <CardTitle>{profile?.full_name}</CardTitle>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
                            {profile?.role?.replace('_', ' ')}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {user.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            {profile?.departments?.name || 'No Department'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={updateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        Full Name
                                    </label>
                                    <input
                                        name="full_name"
                                        type="text"
                                        required
                                        defaultValue={profile?.full_name}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                        Position / Title
                                    </label>
                                    <input
                                        name="position"
                                        type="text"
                                        required
                                        defaultValue={profile?.employees?.[0]?.position}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
