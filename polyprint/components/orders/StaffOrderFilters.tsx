"use client";

interface StaffOrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  colorFilter: string;
  setColorFilter: (val: string) => void;
  sidesFilter: string;
  setSidesFilter: (val: string) => void;
}

export default function StaffOrderFilters({
  searchQuery,
  setSearchQuery,
  colorFilter,
  setColorFilter,
  sidesFilter,
  setSidesFilter,
}: StaffOrderFiltersProps) {
  return (
    <div className="max-w-6xl mx-auto bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order name, ID, or student..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 h-10 shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-gray-400 text-xs">🔍</span>
        </div>

        {/* Color Specification Dropdown */}
        <div>
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 h-10 shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right:14px_center] bg-no-repeat pr-8"
          >
            <option value="all">🎨 Color: All Specifications</option>
            <option value="black_white">Black & White</option>
            <option value="full_color">Full Color</option>
          </select>
        </div>

        {/* Layout Sides Dropdown */}
        <div>
          <select
            value={sidesFilter}
            onChange={(e) => setSidesFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 h-10 shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right:14px_center] bg-no-repeat pr-8"
          >
            <option value="all">📄 Sides: All Layouts</option>
            <option value="one_sided">One-sided</option>
            <option value="double_sided">Double-sided</option>
          </select>
        </div>

      </div>
    </div>
  );
}