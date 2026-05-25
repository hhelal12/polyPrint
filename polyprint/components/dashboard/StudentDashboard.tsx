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
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-[#0D284A]">My Dashboard</h1>
          <p className="text-slate-500">Welcome back, {fullName}</p>
        </div>
        <Link href="/orders/new" className="bg-[#0D284A] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#1a3a63] transition-all shadow-sm">
          + New Order
        </Link>
      </header>

      {/* Simplified Stats Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Active Requests</p>
          <h2 className="text-5xl font-black text-[#0D284A] mt-2">{stats.activeCount}</h2>
        </div>
        <div className="text-6xl">📋</div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
            <h2 className="font-bold text-[#0D284A] text-lg">Recent Activity</h2>
        </div>
        
        {stats.recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-[#0D284A]">{order.order_name || "Untitled Order"}</p>
                  <p className="text-xs text-slate-400">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Date N/A"}
                  </p>
                </div>
                <span className="px-4 py-1.5 bg-cyan-50 text-cyan-700 rounded-xl text-xs font-bold uppercase tracking-wide">
                  {order.status || "Processing"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <p>No recent orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}