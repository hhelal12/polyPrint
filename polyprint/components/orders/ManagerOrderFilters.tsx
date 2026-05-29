"use client";

import { useEffect, useState } from "react";

interface ManagerFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
}

export default function ManagerOrderFilters({
  searchQuery,
  setSearchQuery,
  maxPrice,
  setMaxPrice,
}: ManagerFiltersProps) {

  const [inputValue, setInputValue] = useState<string>(maxPrice.toFixed(3));

  useEffect(() => {
    if (parseFloat(inputValue) !== maxPrice) {
      setInputValue(maxPrice === 0 ? "" : maxPrice.toString());
    }
  }, [maxPrice]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    let num = parseFloat(val);
    if (isNaN(num)) { setMaxPrice(0); return; }
    if (num > 500) num = 500;
    if (num < 0) num = 0;
    setMaxPrice(num);
  };

  const handleInputBlur = () => {
    if (!inputValue || isNaN(parseFloat(inputValue))) {
      setInputValue("0.000");
      setMaxPrice(0);
    } else {
      setInputValue(Number(inputValue).toFixed(3));
    }
  };

  return (
    <div className="space-y-3 bg-slate-50/50 p-4 sm:p-5 rounded-2xl border border-slate-100 mb-6 sm:mb-8">

      {/* ── Search ── */}
      <div className="relative w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, description, or student..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 shadow-sm"
        />
        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
      </div>

      {/* ── Price controller ── */}
      <div className="flex flex-col gap-2 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Max Price Constraint
          </span>

          <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 px-2 py-1 rounded-xl">
            <span className="text-[10px] font-bold text-cyan-700 font-mono">BHD</span>
            <input
              type="number"
              min="0"
              max="500"
              step="0.005"
              value={inputValue}
              placeholder="0.000"
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              className="w-20 sm:w-24 bg-white border border-cyan-200/60 rounded-md text-xs font-mono font-bold text-cyan-800 px-1 py-0.5 text-center focus:outline-none focus:border-cyan-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Slider */}
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">0</span>
          <input
            type="range"
            min="0"
            max="500"
            step="0.005"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">500</span>
        </div>
      </div>

    </div>
  );
}