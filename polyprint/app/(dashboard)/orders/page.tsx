import { getMyOrders } from "@/lib/orders/order";
import Link from "next/link";

export default async function OrdersDashboard() {
  const { data: orders, error } = await getMyOrders();

  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100">
        Error loading orders: {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Print Orders</h1>
          <p className="text-slate-500">Track your CDOFS requests and approval status.</p>
        </div>
        <Link 
          href="/dashboard/new-order" 
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
        >
          + New Request
        </Link>
      </header>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-slate-800">No orders found</h3>
          <p className="text-slate-500 mt-2">You haven't submitted any print requests yet.</p>
          <Link href="/dashboard/new-order" className="text-cyan-600 font-medium mt-4 inline-block hover:underline">
            Submit your first order &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any) => (
            <div 
              key={order.id} 
              className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyles(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* --- DISPLAY ORDER NAME --- */}
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {order.order_name || "Untitled Request"}
                </h3>

                {/* --- DISPLAY DESCRIPTION --- */}
                {order.description && (
                  <p className="text-slate-600 text-sm mt-1 mb-3 line-clamp-2 italic">
                    "{order.description}"
                  </p>
                )}

                <div className="flex flex-wrap gap-2 items-center mt-2">
                   <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium">
                    {order.order_items[0]?.service_type}
                   </span>
                   <p className="text-sm text-slate-500">
                    {order.order_items[0]?.paper_size} • {order.order_items[0]?.color_mode} • {order.order_items[0]?.print_sides} • Qty: {order.order_items[0]?.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end justify-start pt-1">
                <span className="text-sm font-semibold text-slate-700">
                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric'
                  })}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  {new Date(order.created_at).toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'pending_approval':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'approved':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'ready':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}