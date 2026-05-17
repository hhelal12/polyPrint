"use client";

import { useState } from "react";
import Link from "next/link";
import { updateOrderStatusAction } from "@/lib/orders/order";

// Improved interface for clarity based on image_aeb8d8.png
interface OrderItem {
  service_type: string | null;
  quantity: number | null;
  paper_size?: string | null;
  color_mode?: string | null;
}

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

  const pageSize = 8; 
  const totalPages = Math.ceil(totalCount / pageSize);
  const isPaginationActive = totalCount > pageSize;

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-[#0D284A]">Pending Approvals</h2>
        </div>

        <div className="divide-y divide-gray-50">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const requesterName = order.requester?.full_name;
              const currentNote = managerNotes[order.id] || "";

              return (
                <div key={order.id} className="p-6 flex flex-col gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      {/* Order Name & Description */}
                      <div>
                        <p className="font-bold text-[#0D284A] text-lg leading-tight">
                          {order.order_name || "Untitled Order"}
                        </p>
                        {order.description && (
                          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                            {order.description}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-gray-400">
                        Requested by:{" "}
                        <span className="font-semibold text-gray-600">
                          {requesterName || `ID: ${order.requester_id?.slice(0, 8)}`}
                        </span>
                      </p>
                      
                      {/* --- ORDER ITEMS SECTION --- */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.order_items?.map((item: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="inline-flex flex-col px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-100"
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                              {item.service_type || "Print Job"}
                            </span>
                            <span className="text-sm font-bold">
                               x{item.quantity || 1} {item.paper_size ? `(${item.paper_size})` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        disabled={loadingId === order.id}
                        onClick={() => handleAction(order.id, "approved")}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
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
                  </div>

                  {/* Note Input Field */}
                  <div className="w-full">
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
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center">
              <span className="text-4xl mb-4 block">✨</span>
              <p className="text-gray-400 font-medium">All caught up! No pending orders.</p>
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {totalCount > 0 && (
          <div className={`p-4 bg-gray-50 border-t border-gray-100 flex justify-center gap-6 items-center ${!isPaginationActive ? "opacity-40" : ""}`}>
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