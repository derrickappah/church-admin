import React from 'react';
import {
    Globe,
    Truck,
    FileCheck,
    Receipt,
    GraduationCap,
    School,
    BookOpen,
    ClipboardList,
    Plus,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsIndexPage() {
    const reportCategories = [
        {
            title: "Missions Reports",
            description: "Tracking outreach and mission activities",
            href: "/reports/missions",
            icon: Globe,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Move Reports",
            description: "Tracking logistical changes and movements",
            href: "/reports/move",
            icon: Truck,
            color: "text-amber-600",
            bgColor: "bg-amber-50"
        },
        {
            title: "MCP Reports",
            description: "Monthly Church Program reports and activities",
            href: "/reports/mcp",
            icon: FileCheck,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            title: "Financial Reports",
            description: "Track monthly financial activities and statements",
            href: "/reports/financial",
            icon: Receipt,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "GTVET Reports",
            description: "Ghana Technical and Vocational Education reports",
            href: "/reports/gtvet",
            icon: GraduationCap,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Vocational School",
            description: "Activities and progress at Adidome Vocational",
            href: "/reports/adidome-vocational",
            icon: School,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "Preparatory School",
            description: "Activities and progress at Adidome Preparatory",
            href: "/reports/adidome-preparatory",
            icon: BookOpen,
            color: "text-teal-600",
            bgColor: "bg-teal-50"
        },
        {
            title: "Department Reports",
            description: "Internal departmental activity reports",
            href: "/reports/departments",
            icon: ClipboardList,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reports Central</h1>
                <p className="text-slate-500 mt-2">Access and manage all church and school reports from one central hub.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {reportCategories.map((category) => (
                    <Card key={category.title} className="hover:shadow-lg transition-all duration-300 border-slate-200 group overflow-hidden">
                        <CardHeader className={`${category.bgColor} border-b border-white/50 transition-colors group-hover:bg-opacity-80`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white shadow-sm ${category.color}`}>
                                    <category.icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-lg text-slate-800">{category.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-sm text-slate-600 min-h-[40px]">
                                {category.description}
                            </p>
                            <div className="flex items-center justify-between gap-2 pt-2">
                                <Link href={category.href} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full justify-between hover:bg-slate-50">
                                        View All
                                        <ArrowRight className="h-4 w-4 ml-2 opacity-50" />
                                    </Button>
                                </Link>
                                <Link href={`${category.href}/create`}>
                                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800" title="Create New">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
