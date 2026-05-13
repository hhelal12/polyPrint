"use client";

import { useState } from "react"; // Added
import Link from "next/link";
import { updateOrderStatusAction } from "@/lib/orders/order";

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
  // State to hold notes for each order ID
  const [managerNotes, setManagerNotes] = useState<{ [key: string]: string }>({});

  const pageSize = 8; 
  const totalPages = Math.ceil(totalCount / pageSize);
  const isPaginationActive = totalCount > pageSize;

  const handleNoteChange = (orderId: string, val: string) => {
    setManagerNotes(prev => ({ ...prev, [orderId]: val }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0D284A]">Welcome, {fullName}</h1>
        <p className="text-gray-500">PolyPrint Manager Approval Portal</p>
      </header>

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
                <div key={order.id} className="p-6 flex flex-col gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#0D284A]">
                        {order.order_name || `Order #${order.id.slice(0, 5)}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Requested by:{" "}
                        <span className="font-semibold text-gray-600">
                          {requesterName || `ID: ${order.requester_id?.slice(0, 8)}`}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => await updateOrderStatusAction(order.id, "approved", currentNote)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => await updateOrderStatusAction(order.id, "rejected", currentNote)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Note Input Field */}
                  <div className="w-full">
                    <input
                      type="text"
                      placeholder="Add a note for the student (optional)..."
                      className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D284A] bg-white transition-all"
                      value={currentNote}
                      onChange={(e) => handleNoteChange(order.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-gray-400 font-medium">No pending orders found.</div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        {totalCount > 0 && (
          <div className={`p-4 bg-gray-50/50 border-t border-gray-100 flex justify-center gap-6 items-center ${!isPaginationActive ? "opacity-40" : ""}`}>
            <Link
              href={isPaginationActive ? `?page=${currentPage - 1}` : "#"}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage <= 0 || !isPaginationActive ? "text-gray-400 pointer-events-none" : "text-[#0D284A]"
              }`}
            >
              ← Previous
            </Link>

            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Page {currentPage + 1} of {Math.max(1, totalPages)}
            </span>

            <Link
              href={isPaginationActive ? `?page=${currentPage + 1}` : "#"}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage >= totalPages - 1 || !isPaginationActive ? "text-gray-400 pointer-events-none" : "text-[#0D284A]"
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