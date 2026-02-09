'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download,
  Clock,
  User
} from 'lucide-react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

// Mock Data for Demo
const MOCK_REQ = {
  id: 'REQ-001',
  title: 'Office Supplies Restock',
  amount: 250.00,
  purpose: 'Monthly restock of pens, paper, and printer ink for the administration office.',
  status: 'pending', // Change to 'approved' to see approved state
  created_by: 'Sarah Staff',
  created_at: '2025-06-15T10:30:00Z',
  department: 'Administration'
};

export default function RequisitionDetailPage({ params }) {
  const [status, setStatus] = useState(MOCK_REQ.status);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // DEMO: Simulate Admin Role
  const IS_ADMIN = true;

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setStatus('approved');
      setIsProcessing(false);
    }, 1000);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStatus('rejected');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/requisitions" className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Requisition {params.id}</h1>
            <Badge variant={
              status === 'approved' ? 'success' : 
              status === 'rejected' ? 'danger' : 'warning'
            }>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">Created on {new Date(MOCK_REQ.created_at).toLocaleDateString()}</p>
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
                  <p className="text-lg font-medium text-slate-900">{MOCK_REQ.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Purpose</label>
                  <p className="text-slate-600 mt-1">{MOCK_REQ.purpose}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Attachments</h3>
              <div className="mt-4">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">invoice_june.pdf</p>
                    <p className="text-xs text-slate-500">2.4 MB</p>
                  </div>
                  <Button className="ml-auto bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-none h-8 px-3">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Amount</span>
                <span className="text-xl font-bold text-slate-900">${MOCK_REQ.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Department</span>
                <span className="font-medium text-slate-900">{MOCK_REQ.department}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Requested By</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">SS</div>
                  <span className="font-medium text-slate-900">Sarah</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Workflow Actions */}
          {status === 'pending' && IS_ADMIN && (
            <Card className="p-6 border-blue-200 bg-blue-50/30">
              <h3 className="font-semibold text-blue-900 mb-2">Approval Required</h3>
              <p className="text-sm text-blue-700 mb-4">Review this request and take action.</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleReject} 
                  disabled={isProcessing}
                  className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </Card>
          )}

          {status === 'approved' && (
            <Card className="p-6 border-green-200 bg-green-50/30">
              <div className="flex items-center gap-2 mb-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <h3 className="font-semibold">Approved</h3>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Approved on {new Date().toLocaleDateString()}
              </p>
              <a 
                href={`/api/requisitions/${params.id}/pdf`} 
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
