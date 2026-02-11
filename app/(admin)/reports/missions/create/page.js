import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { createMissionReport } from '../actions';

export default async function NewMissionReportPage() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/reports/missions">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">New Mission Report</h2>
                    <p className="text-sm text-slate-500">Submit a new missions activity report</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Report Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createMissionReport} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="month" className="block text-sm font-medium text-slate-700 mb-2">
                                    Month
                                </label>
                                <select
                                    id="month"
                                    name="month"
                                    required
                                    defaultValue={currentMonth}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-2">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    name="year"
                                    required
                                    defaultValue={currentYear}
                                    min="2020"
                                    max="2100"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                                Report Content
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                required
                                rows="10"
                                placeholder="Describe the missions activities, outreach programs, and outcomes for this period..."
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href="/reports/missions">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit">
                                Submit Report
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
