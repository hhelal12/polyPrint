import Link from 'next/link';

interface Order {
  id: string;
  order_name: string | null;
  status: string | null;
  created_at: string | null;
}

interface StudentStats {
  activeCount: number;
  recentOrders: Order[];
}

export default function StudentDashboard({ fullName, stats }: { fullName: string, stats: StudentStats }) {
  return (
    // Reduced padding for mobile (p-4) vs desktop (p-8)
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8 bg-slate-50 min-h-screen">
      
      {/* Header: Stacks on mobile, inline on tablet+ */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0D284A]">My Dashboard</h1>
          <p className="text-slate-500 text-sm md:text-base">Welcome back, {fullName}</p>
        </div>
        <Link 
          href="/orders/new" 
          className="w-full sm:w-auto text-center bg-[#0D284A] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#1a3a63] transition-all shadow-sm"
        >
          + New Order
        </Link>
      </header>

      {/* Stats Section: Keeps its layout but reduces padding on small screens */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest">Active Requests</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#0D284A] mt-1 md:mt-2">{stats.activeCount}</h2>
        </div>
        <div className="text-4xl md:text-6xl">📋</div>
      </div>

      {/* History Section: Full-width table-like behavior */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-50">
            <h2 className="font-bold text-[#0D284A] text-base md:text-lg">Recent Activity</h2>
        </div>
        
        {stats.recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {stats.recentOrders.map((order) => (
              // Using flex-col for very small screens if names are long, 
              // but here we keep flex-row with responsive spacing
              <div key={order.id} className="p-4 md:p-6 flex justify-between items-center hover:bg-slate-50 transition-colors gap-4">
                <div className="min-w-0"> {/* min-w-0 allows truncation */}
                  <p className="font-bold text-[#0D284A] truncate">{order.order_name || "Untitled Order"}</p>
                  <p className="text-[10px] md:text-xs text-slate-400">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Date N/A"}
                  </p>
                </div>
                <span className="shrink-0 px-3 md:px-4 py-1 bg-cyan-50 text-cyan-700 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wide">
                  {order.status || "Processing"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center text-slate-400 text-sm">
            <p>No recent orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}