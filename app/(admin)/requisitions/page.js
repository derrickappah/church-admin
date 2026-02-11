import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function RequisitionsPage() {
    const supabase = await createClient();

    const { data: requisitions, error } = await supabase
        .from('requisitions')
        .select(`
      *,
      profiles:created_by (full_name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching requisitions:', error);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Requisitions</h2>
                    <p className="text-sm text-slate-500">Submit and track financial requests</p>
                </div>
                <Link href="/requisitions/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        New Requisition
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title or reference..."
                                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Requested By</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!requisitions || requisitions.length === 0) ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <AlertCircle className="h-10 w-10 text-slate-200 mb-2" />
                                                <p className="font-medium">No requisitions found</p>
                                                <p className="text-xs">Try adjusting your filters or create a new request.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requisitions.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-slate-400">REQ-{req.id.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-900 truncate block max-w-[200px]">{req.title}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{req.profiles?.full_name || 'Staff'}</td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">GHS {parseFloat(req.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={
                                                    req.status === 'approved' ? 'success' :
                                                        req.status === 'rejected' ? 'destructive' :
                                                            req.status === 'submitted' ? 'secondary' : 'outline'
                                                } className="capitalize shadow-none">
                                                    {req.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/requisitions/${req.id}`}
                                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    View
                                                </Link>
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
    );
}

function AlertCircle(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}
