'use client';

import React, { useState, useEffect } from 'react';
import NavLink from '@/components/NavLink';
import {
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    X
} from 'lucide-react';

export default function PortalLayoutClient({ children, profile, userInitials, userName }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [isReportsExpanded, setIsReportsExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        }

        // Also load reports expanded state
        const savedReportsState = localStorage.getItem('sidebarReportsExpanded');
        if (savedReportsState !== null) {
            setIsReportsExpanded(JSON.parse(savedReportsState));
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const toggleReports = () => {
        const newState = !isReportsExpanded;
        setIsReportsExpanded(newState);
        localStorage.setItem('sidebarReportsExpanded', JSON.stringify(newState));
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isAdmin = ['president', 'manager', 'it_staff'].includes(profile?.role);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-[60] ${isCollapsed ? 'w-16' : 'w-64'} border-r border-slate-200 bg-white shadow-xl md:shadow-sm transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
                    {!isCollapsed && <span className="text-lg font-bold text-blue-900 uppercase tracking-tight">Church Admin</span>}
                    {/* Desktop Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 transition-colors ml-auto"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        )}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={closeMobileMenu}
                        className="flex md:hidden items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 transition-colors ml-auto"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
                    <nav className="space-y-1" onClick={() => { if (window.innerWidth < 768) closeMobileMenu(); }}>
                        <NavLink href="/dashboard" icon="LayoutDashboard" isCollapsed={isCollapsed}>Dashboard</NavLink>

                        {/* Grouped Reports */}
                        <div>
                            <button
                                onClick={toggleReports}
                                className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'justify-between'} rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors group`}
                                title={isCollapsed ? 'Reports' : ''}
                            >
                                <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                                    <ClipboardList className="h-4 w-4" />
                                    {!isCollapsed && <span>Reports</span>}
                                </div>
                                {!isCollapsed && (
                                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isReportsExpanded ? 'rotate-90' : ''}`} />
                                )}
                            </button>

                            {(isReportsExpanded || isCollapsed) && !isCollapsed && (
                                <div className="mt-1 space-y-1">
                                    <NavLink href="/reports" icon="LayoutDashboard" isCollapsed={isCollapsed} isSubLink>Overview</NavLink>
                                    <NavLink href="/reports/missions" icon="Globe" isCollapsed={isCollapsed} isSubLink>Missions</NavLink>
                                    <NavLink href="/reports/move" icon="Truck" isCollapsed={isCollapsed} isSubLink>Movements</NavLink>
                                    <NavLink href="/reports/mcp" icon="FileCheck" isCollapsed={isCollapsed} isSubLink>MCP</NavLink>
                                    <NavLink href="/reports/financial" icon="Receipt" isCollapsed={isCollapsed} isSubLink>Financial</NavLink>
                                    <NavLink href="/reports/gtvet" icon="GraduationCap" isCollapsed={isCollapsed} isSubLink>GTVET</NavLink>
                                    <NavLink href="/reports/adidome-vocational" icon="School" isCollapsed={isCollapsed} isSubLink>Vocational</NavLink>
                                    <NavLink href="/reports/adidome-preparatory" icon="BookOpen" isCollapsed={isCollapsed} isSubLink>Preparatory</NavLink>
                                    <NavLink href="/reports/departments" icon="ClipboardList" isCollapsed={isCollapsed} isSubLink>Departments</NavLink>
                                </div>
                            )}
                        </div>

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
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100 transition-colors"
                        >
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
