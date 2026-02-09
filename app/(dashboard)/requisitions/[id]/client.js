'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download,
  Loader2
} from 'lucide-react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { approveRequisition, rejectRequisition } from '../actions';

export default function RequisitionClientPage({ requisition, userRole }) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canApprove = ['president', 'manager', 'it_staff'].includes(userRole);
  const isPending = requisition.status === 'pending' || requisition.status === 'draft' || requisition.status === 'submitted';

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveRequisition(requisition.id);
    } catch (error) {
      alert('Failed to approve: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await rejectRequisition(requisition.id);
    } catch (error) {
      alert('Failed to reject: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/requisitions" className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Requisition</h1>
            <Badge variant={
              requisition.status === 'approved' ? 'success' : 
              requisition.status === 'rejected' ? 'danger' : 'warning'
            }>
              {requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">Created on {new Date(requisition.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Details</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <p className="text-lg font-medium text-slate-900">{requisition.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Purpose</label>
                  <p className="text-slate-600 mt-1">{requisition.purpose || 'No purpose specified'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Attachments</h3>
              {requisition.attachments && requisition.attachments.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {requisition.attachments.map((file, idx) => (
                     <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Attachment {idx + 1}</p>
                      </div>
                      <Button className="ml-auto bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-none h-8 px-3">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 italic">No attachments</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Amount</span>
                <span className="text-xl font-bold text-slate-900">${Number(requisition.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Department</span>
                <span className="font-medium text-slate-900">{requisition.department_id || 'General'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Requested By</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                    {requisition.profiles?.full_name?.charAt(0) || '?'}
                  </div>
                  <span className="font-medium text-slate-900">{requisition.profiles?.full_name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Workflow Actions */}
          {isPending && canApprove && (
            <Card className="p-6 border-blue-200 bg-blue-50/30">
              <h3 className="font-semibold text-blue-900 mb-2">Approval Required</h3>
              <p className="text-sm text-blue-700 mb-4">Review this request and take action.</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleReject} 
                  disabled={isProcessing}
                  className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Approve
                </Button>
              </div>
            </Card>
          )}

          {requisition.status === 'approved' && (
            <Card className="p-6 border-green-200 bg-green-50/30">
              <div className="flex items-center gap-2 mb-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <h3 className="font-semibold">Approved</h3>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Approved on {new Date(requisition.approved_at).toLocaleDateString()}
              </p>
              <a 
                href={`/api/requisitions/${requisition.id}/pdf`} 
                target="_blank"
                className="w-full inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Withdrawal Form
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
