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
};

export default function NavLink({ href, icon, children }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    const Icon = iconMap[icon];

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                }`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </Link>
    );
}
