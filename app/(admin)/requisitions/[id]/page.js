import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, DollarSign, FileText, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { approveRequisition, rejectRequisition } from '../actions';

export default async function RequisitionDetailPage({ params }) {
    const { id } = params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: requisition, error: reqError } = await supabase
        .from('requisitions')
        .select('*')
        .eq('id', id)
        .single();

    if (reqError || !requisition) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-red-800">Error Loading Requisition</h3>
                    <p className="text-sm text-red-600 mt-2">ID: {id}</p>
                    <p className="text-sm text-red-600">Error: {reqError ? JSON.stringify(reqError) : 'Requisition not found (null data)'}</p>
                </div>
            </div>
        );
    }

    // Fetch related profiles manually since foreign keys point to auth.users
    const { data: createdByProfile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', requisition.created_by)
        .single();

    let approverProfile = null;
    if (requisition.approved_by) {
        const { data: approver } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', requisition.approved_by)
            .single();
        approverProfile = approver;
    }

    // Attach to requisition object to match expected structure
    requisition.profiles = createdByProfile;
    requisition.approver = approverProfile;



    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = ['president', 'manager', 'it_staff'].includes(profile?.role);
    const isOwner = requisition.created_by === user.id;

    // RLS will prevent unauthorized access, but we can do a quick check
    if (!isAdmin && !isOwner) {
        redirect('/requisitions');
    }

    return (
        <div className="space-y-6">
            <Link href="/requisitions" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Requisitions
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-slate-900">{requisition.title}</h2>
                        <Badge variant={
                            requisition.status === 'approved' ? 'success' :
                                requisition.status === 'rejected' ? 'destructive' :
                                    requisition.status === 'submitted' ? 'secondary' : 'outline'
                        } className="text-sm px-3 py-1">
                            {requisition.status}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Requested by: <span className="font-medium text-slate-900">{requisition.profiles?.full_name}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Date: <span className="font-medium text-slate-900">{new Date(requisition.created_at).toLocaleDateString()}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Amount: <span className="font-bold text-blue-600">GHS {parseFloat(requisition.amount).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span></span>
                        </div>
                    </div>
                </div>

                {isAdmin && requisition.status === 'submitted' && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <form action={rejectRequisition.bind(null, id)}>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full md:w-auto">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </form>
                        <form action={approveRequisition.bind(null, id)}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </form>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-400" />
                            Request Purpose
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {requisition.purpose || 'No description provided.'}
                        </p>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card shadow-sm>
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                                <div className="mt-1 font-medium capitalize text-slate-900">{requisition.status}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Created At</label>
                                <div className="mt-1 font-medium text-slate-900">{new Date(requisition.created_at).toLocaleString()}</div>
                            </div>
                            {requisition.status === 'approved' && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-bold text-green-600 uppercase">Approved By</label>
                                        <div className="mt-1 font-medium text-slate-900">{requisition.approver?.full_name}</div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-green-600 uppercase">Approved At</label>
                                        <div className="mt-1 font-medium text-slate-900">{new Date(requisition.approved_at).toLocaleString()}</div>
                                    </div>
                                </>
                            )}
                            {requisition.status === 'rejected' && (
                                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                                    <label className="text-[10px] font-bold text-red-600 uppercase">Rejection Reason</label>
                                    <p className="mt-1 text-sm text-red-800 italic">{requisition.rejection_reason || 'No reason provided'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card shadow-sm>
                        <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Attachments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {requisition.attachments?.length > 0 ? (
                                <ul className="space-y-2">
                                    {requisition.attachments.map((file, idx) => (
                                        <li key={idx}>
                                            <a href={file} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                                                <FileText className="h-3 w-3" />
                                                Attachment {idx + 1}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-slate-500 italic">No attachments</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
