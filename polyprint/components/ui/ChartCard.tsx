import React from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-3 min-w-0 w-full overflow-hidden">
      <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate">
        {title}
      </h2>
      <div className="h-48 sm:h-56 md:h-64 w-full relative select-none">
        {children}
      </div>
    </div>
  );
}