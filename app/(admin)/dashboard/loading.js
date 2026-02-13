export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                <div className="h-8 w-16 bg-slate-300 rounded"></div>
                            </div>
                            <div className="h-12 w-12 bg-slate-100 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="h-2 w-2 mt-2 rounded-full bg-slate-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 p-6 bg-slate-50 opacity-50">
                                <div className="rounded-full bg-slate-200 p-6"></div>
                                <div className="h-4 w-20 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
