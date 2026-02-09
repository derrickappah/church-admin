'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

export default function RequisitionsPage() {
  const [filter, setFilter] = useState('all');

  // Mock data
  const requisitions = [
    { id: 'REQ-001', title: 'Office Supplies', amount: 250.00, status: 'pending', date: '2025-06-15' },
    { id: 'REQ-002', title: 'Mission Trip Expenses', amount: 1200.00, status: 'approved', date: '2025-06-12' },
    { id: 'REQ-003', title: 'Sound Equipment Repair', amount: 450.50, status: 'rejected', date: '2025-06-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Requisitions</h2>
          <p className="text-sm text-slate-500">Manage financial requests and approvals</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search requisitions..." 
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Reference</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requisitions.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{req.id}</td>
                <td className="px-6 py-4 text-slate-700">{req.title}</td>
                <td className="px-6 py-4 text-slate-500">{req.date}</td>
                <td className="px-6 py-4 font-medium text-slate-900">${req.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <Badge variant={
                    req.status === 'approved' ? 'success' : 
                    req.status === 'rejected' ? 'danger' : 'warning'
                  }>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
