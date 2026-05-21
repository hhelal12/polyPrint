"use client";

import { useState } from "react";
import Link from "next/link";
import { updateOrderStatusAction } from "@/lib/orders/order";
import ManagerOrderFilters from "@/components/orders/ManagerOrderFilters"; // ◄ Import the updated filter layout here

interface ManagerProps {
  fullName: string;
  orders: any[];
  pendingCount: number;
  totalCount: number;
  currentPage: number;
}

export default function ManagerDashboard({
  fullName,
  orders,
  pendingCount,
  totalCount,
  currentPage,
}: ManagerProps) {
  const [managerNotes, setManagerNotes] = useState<{ [key: string]: string }>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter States (Cleaned up - status filter completely removed)
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);

  const pageSize = 5; 

  const handleNoteChange = (orderId: string, val: string) => {
    setManagerNotes(prev => ({ ...prev, [orderId]: val }));
  };

  const handleAction = async (orderId: string, status: "approved" | "rejected") => {
    setLoadingId(orderId);
    try {
      const result = await updateOrderStatusAction(orderId, status, managerNotes[orderId] || "");
      if (result.error) throw new Error(result.error);
    } catch (error) {
      alert("Failed to update order.");
    } finally {
      setLoadingId(null);
    }
  };

  // Client filtration processing matrix (Evaluates titles, info text, and target costs)
  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      order.order_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.requester?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const price = Number(order.total_price) || 0;
    const matchesPrice = price <= maxPrice;

    return matchesSearch && matchesPrice;
  });

  const totalPages = Math.ceil(filteredOrders.length > 0 ? totalCount / pageSize : 1);
  const isPaginationActive = totalCount > pageSize && searchQuery === "";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0D284A]">Welcome, {fullName}</h1>
        <p className="text-gray-500">PolyPrint Manager Approval Portal</p>
      </header>

      {/* Notification Banner */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3">
        <span className="text-xl">🔔</span>
        <p className="text-sm text-orange-700 font-medium">
          You have <strong>{pendingCount}</strong> requests awaiting your digital signature.
        </p>
      </div>

      {/* 🎛️ Clean New Filter Layer Installed here */}
      <ManagerOrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-[#0D284A]">
            Incoming Requests ({filteredOrders.length})
          </h2>
          <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-mono">
            Limit Scale Max: {maxPrice.toFixed(3)} BHD
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const requesterName = order.requester?.full_name;
              const currentNote = managerNotes[order.id] || "";
              const formattedPrice = Number(order.total_price || 0).toFixed(3);

              return (
                <div key={order.id} className="p-6 flex flex-col gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-bold text-[#0D284A] text-lg leading-tight">
                          {order.order_name || "Untitled Order"}
                        </p>
                        
                        <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 border border-cyan-200/60 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow-sm">
                          BHD {formattedPrice}
                        </span>

                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          order.status === "approved" || order.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : order.status === "rejected" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.status?.replace('_', ' ') || "Pending"}
                        </span>
                      </div>

                      {order.description && (
                        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                          {order.description}
                        </p>
                      )}

                      <p className="text-xs text-gray-400">
                        Requested by:{" "}
                        <span className="font-semibold text-gray-600">
                          {requesterName || `ID: ${order.requester_id?.slice(0, 8)}`}
                        </span>
                      </p>
                      
                      {/* Configuration Details Row Grid */}
                      <div className="mt-4 pt-1 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Print Parameters Configuration Details:
                        </p>
                        
                        <div className="flex flex-col gap-2">
                          {order.order_items?.map((item: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl w-full"
                            >
                              <div className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-medium">
                                <span className="font-bold opacity-70">Type:</span> {item.service_type || "Standard Print"}
                              </div>

                              <div className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md font-medium">
                                <span className="font-bold opacity-70">Size:</span> {item.paper_size || "A4"}
                              </div>

                              <div className={`px-2.5 py-1 rounded-md font-medium border ${
                                item.color_mode?.toLowerCase() === "color"
                                  ? "bg-pink-50 text-pink-700 border-pink-100"
                                  : "bg-slate-200 text-slate-700 border-slate-300"
                              }`}>
                                <span className="font-bold opacity-70">Color:</span> {item.color_mode || "B&W"}
                              </div>

                              <div className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-medium">
                                <span className="font-bold opacity-70">Sides:</span> {item.print_sides || "One-sided"}
                              </div>

                              <div className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-bold font-mono md:ml-auto">
                                Qty: x{item.quantity || 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {order.status === "pending_approval" && (
                      <div className="flex gap-2 shrink-0 self-end lg:self-start">
                        <button
                          disabled={loadingId === order.id}
                          onClick={() => handleAction(order.id, "approved")}
                          className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm"
                        >
                          {loadingId === order.id ? "..." : "Approve"}
                        </button>
                        <button
                          disabled={loadingId === order.id}
                          onClick={() => handleAction(order.id, "rejected")}
                          className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Note Input Field */}
                  {order.status === "pending_approval" && (
                    <div className="w-full mt-1">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">📝</span>
                        <input
                          type="text"
                          placeholder="Add a private note for the student..."
                          className="w-full text-sm pl-9 p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0D284A] bg-white transition-all"
                          value={currentNote}
                          onChange={(e) => handleNoteChange(order.id, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-gray-400 font-medium">No pending records match your search properties.</p>
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {totalCount > 0 && (
          <div className={`p-4 bg-gray-50 border-t border-gray-100 flex justify-center gap-6 items-center ${!isPaginationActive ? "opacity-40 pointer-events-none" : ""}`}>
            <Link
              href={isPaginationActive && currentPage > 0 ? `?page=${currentPage - 1}` : "#"}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                currentPage <= 0 || !isPaginationActive 
                ? "text-gray-300 pointer-events-none" 
                : "text-[#0D284A] hover:bg-white hover:shadow-sm"
              }`}
            >
              ← Previous
            </Link>

            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white border px-4 py-1.5 rounded-full shadow-sm">
              Page {currentPage + 1} of {Math.max(1, totalPages)}
            </span>

            <Link
              href={isPaginationActive && currentPage < totalPages - 1 ? `?page=${currentPage + 1}` : "#"}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                currentPage >= totalPages - 1 || !isPaginationActive 
                ? "text-gray-300 pointer-events-none" 
                : "text-[#0D284A] hover:bg-white hover:shadow-sm"
              }`}
            >
              Next →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}