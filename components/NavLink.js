'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    DollarSign,
    Users,
    CheckSquare,
    Settings,
    Shield,
    Building2,
    ClipboardList,
    Truck,
    Wallet,
    Globe,
    CreditCard,
    FileCheck,
    GraduationCap,
    School,
    BookOpen,
    Receipt
} from 'lucide-react';

const iconMap = {
    LayoutDashboard,
    FileText,
    DollarSign,
    Users,
    CheckSquare,
    Settings,
    Shield,
    Building2,
    ClipboardList,
    Truck,
    Wallet,
    Globe,
    CreditCard,
    FileCheck,
    GraduationCap,
    School,
    BookOpen,
    Receipt
};

export default function NavLink({ href, icon, children, isCollapsed = false, isSubLink = false }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    const Icon = iconMap[icon];

    return (
        <Link
            href={href}
            title={isCollapsed ? children : ''}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-md px-3 py-2 text-sm font-medium transition-colors ${isSubLink && !isCollapsed ? 'pl-9 text-xs' : ''
                } ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                }`}
        >
            {Icon && <Icon className={`h-4 w-4 ${isSubLink ? 'h-3.5 w-3.5 opacity-70' : ''}`} />}
            {!isCollapsed && children}
        </Link>
    );
}

