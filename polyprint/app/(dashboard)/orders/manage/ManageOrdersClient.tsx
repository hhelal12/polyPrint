"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateOrderStatusAction } from "@/lib/orders/staffOrder";

// --- Interfaces aligned with Supabase schema and nullability ---
interface OrderItem {
  id?: string;
  file_url: string;
  service_type: string | null;
  quantity: number | null;
}

interface Order {
  id: string;
  status: string | null;
  order_name: string | null;
  manager_notes: string | null;
  created_at: string | null;
  requester?: {
    full_name: string | null;
  } | null;
  order_items: OrderItem[];
}

interface ManageOrdersProps {
  fullName: string;
  initialOrders: Order[];
}

export default function ManageOrdersClient({ fullName, initialOrders = [] }: ManageOrdersProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  const handleDownload = async (order: Order) => {
    const fileUrl = order.order_items?.[0]?.file_url;
    if (!fileUrl) return alert("No file found.");

    try {
      const { data, error } = await supabase.storage
        .from("print-files")
        .createSignedUrl(fileUrl, 300);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      alert("Could not retrieve file.");
    }
  };

  const handleStatusUpdate = async (orderId: string, nextStatus: "in_progress" | "completed") => {
    if (!confirm(`Mark as ${nextStatus.replace('_', ' ')}?`)) return;
    setLoadingId(orderId);
    try {
      await updateOrderStatusAction(orderId, nextStatus);
    } catch (err) {
      alert("Update failed. Check RLS policies.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-end max-w-6xl mx-auto mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0D284A]">Print Station</h1>
          <p className="text-gray-500">Staff View: {fullName}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
          <span className="text-sm text-gray-500">Active Queue: </span>
          <span className="text-lg font-bold text-[#0D284A]">{initialOrders.length}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Order</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Items</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Manager Notes</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialOrders.map((order) => (
              <tr key={order.id} className="hover:bg-blue-50/30">
                <td className="p-4">
                  <p className="font-bold text-[#0D284A]">{order.order_name || "Untitled"}</p>
                  <p className="text-xs text-gray-400">
                    {order.created_at 
                      ? new Date(order.created_at).toLocaleDateString() 
                      : "Pending Date"}
                  </p>
                </td>
                <td className="p-4 text-sm">
                  {order.order_items?.[0]?.service_type || "Unknown"} (x{order.order_items?.[0]?.quantity || 0})
                </td>
                <td className="p-4 text-sm max-w-[200px]">
                  {order.manager_notes ? (
                    <p className="text-gray-600 italic">"{order.manager_notes}"</p>
                  ) : (
                    <span className="text-gray-300">No notes</span>
                  )}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                    {order.status || "N/A"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDownload(order)} 
                    className="mr-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Download File"
                  >
                    💾
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(order.id, order.status === 'approved' ? 'in_progress' : 'completed')}
                    disabled={loadingId === order.id || order.status === 'completed'}
                    className="px-4 py-2 bg-[#0D284A] text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#1a3a5f] transition-colors"
                  >
                    {loadingId === order.id ? "..." : (order.status === 'approved' ? "Start" : "Done")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No active orders in the queue.
          </div>
        )}
      </div>
    </div>
  );
}