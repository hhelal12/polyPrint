interface Props {
  fullName: string;
  filteredCount: number;
  totalCount: number;
}

export default function StaffHeader({ fullName, filteredCount, totalCount }: Props) {
  return (
    <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D284A]">Print Station</h1>
        <p className="text-gray-500 text-sm">Staff View: {fullName}</p>
      </div>

      <div className="bg-white px-4 py-2.5 rounded-xl border shadow-sm flex items-center gap-4 self-start sm:self-auto">
        <div>
          <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Filtered</span>
          <span className="text-lg font-bold text-cyan-600 font-mono">{filteredCount}</span>
        </div>
        <div className="border-l pl-4">
          <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Total Queue</span>
          <span className="text-lg font-bold text-[#0D284A] font-mono">{totalCount}</span>
        </div>
      </div>
    </header>
  );
}