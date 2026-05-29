interface Props {
    detectedPages: number;
    uploadingFile: boolean;
    dynamicTotalCost: number;
}

export default function PricingSummary({ detectedPages, uploadingFile, dynamicTotalCost }: Props) {
    return (
        <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-white shadow-xl">
            {/* Left — page count */}
            <div className="flex-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Verified Document Profile
                </span>
                <div className="text-sm text-slate-200 font-medium">
                    {detectedPages > 0 ? (
                        <span>
                            📄 Pages:{" "}
                            <strong className="text-cyan-400 font-mono text-base">{detectedPages}</strong>
                        </span>
                    ) : uploadingFile ? (
                        <span className="text-amber-400 italic">Analyzing...</span>
                    ) : (
                        <span className="text-slate-500">No document parsed yet.</span>
                    )}
                </div>
            </div>

            {/* Right — cost */}
            <div className="border-t sm:border-t-0 sm:border-l border-slate-700 pt-3 sm:pt-0 sm:pl-5 text-left sm:text-right shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                    Calculated Final Cost
                </span>
                <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
                    BHD {dynamicTotalCost.toFixed(3)}
                </span>
            </div>
        </div>
    );
}