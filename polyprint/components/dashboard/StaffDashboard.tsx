import Link from "next/link";

interface DashboardStats {
  myHandledCount: number;
  pendingCount: number;
  topStaffName: string;
  topStaffCount: number;
}

interface StaffDashboardProps {
  fullName: string;
  stats: DashboardStats;
}

export default function StaffDashboard({ fullName, stats }: StaffDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D284A] tracking-tight">
            Staff Overview
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Welcome back, {fullName}. Here is your station performance summary.
          </p>
        </header>

        {/* Gamified Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: "Active Queue", value: stats.pendingCount, color: "text-cyan-600", emoji: "⏱️" },
            { label: "My Handled Orders", value: stats.myHandledCount, color: "text-emerald-600", emoji: "✅" },
            { label: "Top Performer", value: stats.topStaffName, sub: `${stats.topStaffCount} orders`, color: "text-amber-600", emoji: "🏆" }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${
                idx === 2 ? "sm:col-span-2 md:col-span-1" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  {item.label}
                </p>
                <span className="text-lg sm:text-xl">{item.emoji}</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black ${item.color} mt-2 sm:mt-3 truncate`}>
                {item.value}
              </h2>
              {item.sub && (
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1">
                  {item.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-[#0D284A] mb-4 sm:mb-6">
            Quick Actions
          </h2>
          
          <Link 
            href="/orders/manage" 
            className="group flex items-center p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border border-transparent hover:border-cyan-200 hover:bg-cyan-50/30 transition-all"
          >
            <div className="p-3 sm:p-4 bg-white rounded-xl shadow-sm text-xl sm:text-2xl group-hover:scale-110 transition-transform shrink-0">
              📋
            </div>
            <div className="ml-4 sm:ml-6 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[#0D284A] truncate">
                Manage Queue
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2 sm:line-clamp-none">
                Track, update, and process current print requests.
              </p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}