"use client";

import { useEffect, useState } from "react";

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  colorFilter: string;         // ◄ Added color state interface
  setColorFilter: (val: string) => void;
  sidesFilter: string;         // ◄ Added print sides interface
  setSidesFilter: (val: string) => void;
}

export default function OrderFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  maxPrice,
  setMaxPrice,
  colorFilter,
  setColorFilter,
  sidesFilter,
  setSidesFilter,
}: OrderFiltersProps) {
  
  // Local string state preserves raw typing strings like "0." or "0.30" without turning them into raw 0
  const [inputValue, setInputValue] = useState<string>(maxPrice.toFixed(3));

  // Sync string input if the parent changes maxPrice from the outside (e.g., slider moves)
  useEffect(() => {
    if (parseFloat(inputValue) !== maxPrice) {
      setInputValue(maxPrice === 0 ? "" : maxPrice.toString());
    }
  }, [maxPrice]);

  const handleInputChange = (val: string) => {
    setInputValue(val); // Update typing layer immediately

    let num = parseFloat(val);
    if (isNaN(num)) {
      setMaxPrice(0);
      return;
    }
    
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
    <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 mb-8">
      {/* Upper Layout: Controls Matrix */}
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
        
        {/* Dropdowns & Text Search Cluster */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-3xl flex-1">
          {/* Text Search Box */}
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 shadow-sm h-9"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          {/* Color Mode Select Filter */}
          <div className="w-full">
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 shadow-sm h-9 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right:12px_center] bg-no-repeat pr-8"
            >
              <option value="all">🎨 Color: All Modes</option>
              <option value="black_white">Black & White</option>
              <option value="full_color">Full Color</option>
            </select>
          </div>

          {/* Print Sides Layout Select Filter */}
          <div className="w-full">
            <select
              value={sidesFilter}
              onChange={(e) => setSidesFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 shadow-sm h-9 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right:12px_center] bg-no-repeat pr-8"
            >
              <option value="all">📄 Sides: All Layouts</option>
              <option value="one_sided">One-sided</option>
              <option value="double_sided">Double-sided</option>
            </select>
          </div>
        </div>

        {/* 🎛️ Interactive Price Controller Panel */}
        <div className="w-full lg:max-w-xs flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Max Price Constraint
            </span>
            
            <div className="flex items-center gap-1.5 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-xl">
              <span className="text-[9px] font-bold text-cyan-700 font-mono">BHD</span>
              <input
                type="number"
                min="0"
                max="500"
                step="0.005"
                value={inputValue} 
                placeholder="0.000"
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                className="w-20 bg-white border border-cyan-200/60 rounded-md text-xs font-mono font-bold text-cyan-800 px-1 py-0.5 text-center focus:outline-none focus:border-cyan-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          
          {/* Slider Line */}
          <div className="flex items-center gap-2.5 mt-0.5">
            <span className="text-[9px] font-mono text-slate-400 font-bold">0</span>
            <input
              type="range"
              min="0"
              max="500"
              step="0.005"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <span className="text-[9px] font-mono text-slate-400 font-bold">500</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending_approval", label: "Pending" },
          { id: "approved", label: "Approved" },
          { id: "completed", label: "Completed" },
          { id: "rejected", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              statusFilter === tab.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}