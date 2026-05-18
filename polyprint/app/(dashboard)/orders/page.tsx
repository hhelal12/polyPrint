"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/lib/orders/order";
import Link from "next/link";

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error: fetchError } = await getMyOrders();
        if (fetchError) {
          setError(fetchError);
        } else if (data) {
          setOrders(data);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 text-center text-slate-500 text-sm font-medium">
        Loading your print orders... ⏳
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100 text-sm">
          Error loading orders: {error}
        </div>
      </div>
    );
  }

  // --- Dynamic Filtering Logic ---
  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    const searchTarget = (order.order_name || "").toLowerCase() + " " + (order.description || "").toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Print Orders</h1>
          <p className="text-slate-500">Track your CDOFS requests and approval status.</p>
        </div>
        <Link 
          href="/dashboard/new-order" 
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm text-sm"
        >
          + New Request
        </Link>
      </header>

      {/* --- Search and Filter Control Panel Row --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        {/* Search Bar Input */}
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by name or description..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all text-slate-700 shadow-sm"
          />
          <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
        </div>

        {/* Filter Tabs Stack */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "pending_approval", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "completed", label: "completed" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
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

      {/* --- Orders Workspace Core Container --- */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-slate-800">No matching orders</h3>
          <p className="text-slate-500 mt-2">Adjust your filtering constraints or query terms.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order: any) => (
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

                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {order.order_name || "Untitled Request"}
                </h3>

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
    case 'completed':
      return 'bg-green-50 text-green-700 border border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}