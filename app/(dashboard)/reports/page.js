import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-slate-100 p-4">
        <FileText className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Reports Module</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Mission reports, Move reports, and Department summaries will be managed here.
      </p>
    </div>
  );
}
