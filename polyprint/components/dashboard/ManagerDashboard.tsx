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
  // Controlled state dictionary for notes tracking
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Section */}
      <header>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0D284A]">Welcome, {fullName}</h1>
        <p className="text-xs sm:text-sm text-gray-500">PolyPrint Manager Approval Portal</p>
      </header>

      {/* Alert Notification Banner */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
        <span className="text-sm shrink-0">🔔</span>
        <p className="text-sm text-orange-700 font-medium">
          You have <strong>{pendingCount}</strong> requests awaiting approval.
        </p>
      </div>

      {/* Filter Row Component */}
      <ManagerOrderFilters 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        maxPrice={maxPrice} 
        setMaxPrice={setMaxPrice} 
      />

      {/* Main Container List Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50/50 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  
                  {/* Order Details Column */}
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-[#0D284A] text-base sm:text-lg break-words">
                      {order.order_name}
                    </h3>
                    <p className="text-xs text-gray-500">Requester: {order.requester?.full_name}</p>
                    <p className="text-sm font-mono font-bold text-cyan-600 pt-1">
                      {(Number(order.total_price) || 0).toFixed(3)} BHD
                    </p>
                  </div>
                  
                  {/* Mobile-Responsive CTA Action Group Button Elements */}
                  {order.status === "pending_approval" && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleAction(order.id, "approved")} 
                        className="flex-1 md:flex-initial px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold transition hover:bg-green-700 disabled:opacity-50" 
                        disabled={loadingId === order.id}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(order.id, "rejected")} 
                        className="flex-1 md:flex-initial px-4 py-2.5 bg-red-100 text-red-600 rounded-xl text-xs font-bold transition hover:bg-red-200 disabled:opacity-50" 
                        disabled={loadingId === order.id}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Fixed Controlled Text Input Field */}
                <input 
                  type="text"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-cyan-600" 
                  placeholder="Private note..."
                  value={managerNotes[order.id] || ""} // Fallback fixes uncontrolled warning runtime error
                  onChange={(e) => handleNoteChange(order.id, e.target.value)}
                />
              </div>
            ))
          ) : (
            <p className="p-10 text-center text-gray-400 text-sm">No requests found.</p>
          )}
        </div>
      </div>

      {/* Dialog Confirmation Component */}
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