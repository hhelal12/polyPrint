
"use client";

import { useState } from "react";
import Link from "next/link";
import { updateOrderStatusAction } from "@/lib/orders/order";
import ManagerOrderFilters from "@/components/orders/ManagerOrderFilters";
import Popup from "@/components/ui/Popup";

interface ManagerProps {
  fullName: string;
  orders: any[];
  pendingCount: number;
  totalCount: number;
  currentPage: number;
}

export default function ManagerDashboard({
  fullName, orders, pendingCount, totalCount, currentPage,
}: ManagerProps) {
  const [managerNotes, setManagerNotes] = useState<{ [key: string]: string }>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "", variant: "info" });

  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(500);
  const pageSize = 5;

  const handleNoteChange = (orderId: string, val: string) => {
    setManagerNotes(prev => ({ ...prev, [orderId]: val }));
  };

  const handleAction = async (orderId: string, status: "approved" | "rejected") => {
    setPopup({
      isOpen: true,
      title: `${status.charAt(0).toUpperCase() + status.slice(1)} Order`,
      message: `Are you sure you want to ${status} this request?`,
      variant: "info",
      onConfirm: async () => {
        setLoadingId(orderId);
        try {
          const result = await updateOrderStatusAction(orderId, status, managerNotes[orderId] || "");
          if (result?.error) throw new Error(result.error);
          setPopup({ isOpen: true, title: "Success", message: "Order status updated.", variant: "success" });
        } catch (error) {
          setPopup({ isOpen: true, title: "Error", message: "Failed to update order.", variant: "error" });
        } finally {
          setLoadingId(null);
        }
      }
    });
  };

  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch =
      order.order_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.requester?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = Number(order.total_price || 0) <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const isPaginationActive = totalCount > pageSize && searchQuery === "";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#0D284A]">Welcome, {fullName}</h1>
        <p className="text-gray-500">PolyPrint Manager Approval Portal</p>
      </header>

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3">
        <p className="text-sm text-orange-700 font-medium">🔔 You have <strong>{pendingCount}</strong> requests awaiting approval.</p>
      </div>

      <ManagerOrderFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#0D284A]">{order.order_name}</h3>
                    <p className="text-xs text-gray-500">Requester: {order.requester?.full_name}</p>
                    <p className="text-sm font-mono font-bold text-cyan-600 mt-1">{(Number(order.total_price) || 0).toFixed(3)} BHD</p>
                  </div>
                  {order.status === "pending_approval" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(order.id, "approved")} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold" disabled={loadingId === order.id}>Approve</button>
                      <button onClick={() => handleAction(order.id, "rejected")} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold" disabled={loadingId === order.id}>Reject</button>
                    </div>
                  )}
                </div>
                <input 
                  className="w-full mt-3 p-2 border rounded-lg text-sm" 
                  placeholder="Private note..."
                  onChange={(e) => handleNoteChange(order.id, e.target.value)}
                />
              </div>
            ))
          ) : (
            <p className="p-10 text-center text-gray-400">No requests found.</p>
          )}
        </div>
      </div>

      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onClose={() => setPopup(p => ({ ...p, isOpen: false }))}
        onConfirm={popup.onConfirm}
      />
    </div>
  );
}
