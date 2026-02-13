'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import NavLink from '@/components/NavLink';
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function PortalLayout({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            // Fetch user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', user.id)
                .single();

            setProfile(profile);
            setLoading(false);
        };

        // Load collapse state from localStorage
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        }

        initAuth();
    }, [router]);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    const isAdmin = ['president', 'manager', 'it_staff'].includes(profile?.role);

    let userInitials = 'U';
    let userName = 'User';

    if (profile?.full_name) {
        userName = profile.full_name;
        const nameParts = profile.full_name.trim().split(' ');
        if (nameParts.length >= 2) {
            userInitials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
        } else if (nameParts.length === 1) {
            userInitials = nameParts[0].substring(0, 2);
        }
        userInitials = userInitials.toUpperCase();
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-16' : 'w-64'} border-r border-slate-200 bg-white shadow-sm hidden md:block transition-all duration-300`}>
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
                    {!isCollapsed && <span className="text-lg font-bold text-blue-900 uppercase tracking-tight">Church Admin</span>}
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 transition-colors ml-auto"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        )}
                    </button>
                </div>

                <div className="px-3 py-4">
                    <nav className="space-y-1">
                        <NavLink href="/dashboard" icon="LayoutDashboard" isCollapsed={isCollapsed}>Dashboard</NavLink>
                        <NavLink href="/reports/missions" icon="Globe" isCollapsed={isCollapsed}>Mission Reports</NavLink>
                        <NavLink href="/reports/move" icon="Truck" isCollapsed={isCollapsed}>Move Reports</NavLink>
                        <NavLink href="/reports/departments" icon="ClipboardList" isCollapsed={isCollapsed}>Dept Reports</NavLink>
                        <NavLink href="/requisitions" icon="DollarSign" isCollapsed={isCollapsed}>Requisitions</NavLink>
                        {isAdmin && (
                            <NavLink href="/approvals" icon="CheckSquare" isCollapsed={isCollapsed}>Approvals</NavLink>
                        )}
                        <NavLink href="/withdrawals" icon="Wallet" isCollapsed={isCollapsed}>Withdrawals</NavLink>
                        <NavLink href="/employees" icon="Users" isCollapsed={isCollapsed}>Employees</NavLink>
                        {isAdmin && (
                            <NavLink href="/departments" icon="Building2" isCollapsed={isCollapsed}>Departments</NavLink>
                        )}
                        {isAdmin && (
                            <NavLink href="/users" icon="Users" isCollapsed={isCollapsed}>User Management</NavLink>
                        )}
                    </nav>
                </div>

                <div className="absolute bottom-0 w-full border-t border-slate-200 bg-slate-50 p-4">
                    <form action="/api/auth/signout" method="post">
                        <button
                            className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'gap-2'} rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors`}
                            title={isCollapsed ? 'Sign Out' : ''}
                        >
                            <LogOut className="h-4 w-4" />
                            {!isCollapsed && 'Sign Out'}
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${isCollapsed ? 'md:pl-16' : 'md:pl-64'} transition-all duration-300`}>
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden">
                            <Menu className="h-6 w-6 text-slate-500" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900 leading-none">Church Management</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-slate-900 leading-none">{userName}</p>
                            <p className="text-xs text-slate-500 capitalize leading-none mt-1">{profile?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-blue-50" title={userName}>
                            {userInitials}
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
