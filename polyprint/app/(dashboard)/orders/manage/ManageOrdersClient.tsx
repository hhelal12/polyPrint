"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateOrderStatusAction } from "@/lib/orders/staffOrder";
import StaffOrderFilters from "@/components/orders/StaffOrderFilters";
import Popup from "@/components/ui/Popup";

interface OrderItem {
  id?: string;
  file_url: string;
  service_type: string | null;
  quantity: number | null;
  paper_size: string | null;
  color_mode: string | null;
  print_sides: string | null;
}

interface Order {
  id: string;
  status: string | null;
  order_name: string | null;
  total_price?: number | string | null;
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

  // Popup State for UI alerts and confirmations
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
    onConfirm?: () => void;
  }>({ isOpen: false, title: "", message: "", variant: "info" });

  const [searchQuery, setSearchQuery] = useState("");
  const [colorFilter, setColorFilter] = useState("all");
  const [sidesFilter, setSidesFilter] = useState("all");

  const handleDownload = async (order: Order) => {
    const fileUrl = order.order_items?.[0]?.file_url;
    if (!fileUrl) {
      setPopup({ isOpen: true, title: "Error", message: "No file found for this order.", variant: "error" });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("print-files")
        .createSignedUrl(fileUrl, 300);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      setPopup({ isOpen: true, title: "Download Failed", message: "Could not retrieve file. Please try again.", variant: "error" });
    }
  };

  const handleStatusUpdate = async (orderId: string, nextStatus: "in_progress" | "completed") => {
    setPopup({
      isOpen: true,
      title: "Confirm Status Update",
      message: `Are you sure you want to mark this order as ${nextStatus.replace('_', ' ')}?`,
      variant: "info",
      onConfirm: async () => {
        setLoadingId(orderId);
        try {
          await updateOrderStatusAction(orderId, nextStatus);
          setPopup({ isOpen: true, title: "Success", message: "Order updated successfully.", variant: "success" });
        } catch (err) {
          setPopup({ isOpen: true, title: "Update Failed", message: "There was a problem updating the order. Check RLS policies.", variant: "error" });
        } finally {
          setLoadingId(null);
        }
      }
    });
  };

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const searchTarget = (
        (order.order_name || "") + " " + 
        (order.id || "") + " " + 
        (order.requester?.full_name || "")
      ).toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

      const item = order.order_items?.[0];
      const itemColorMode = item?.color_mode?.toLowerCase() === "full_color" || item?.color_mode?.toLowerCase() === "color"
        ? "full_color"
        : "black_white";

      const itemPrintSides = item?.print_sides?.toLowerCase() === "double-sided" || item?.print_sides?.toLowerCase() === "double_sided"
        ? "double_sided"
        : "one_sided";

      const matchesColor = colorFilter === "all" || itemColorMode === colorFilter;
      const matchesSides = sidesFilter === "all" || itemPrintSides === sidesFilter;

      return matchesSearch && matchesColor && matchesSides;
    });
  }, [initialOrders, searchQuery, colorFilter, sidesFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end max-w-6xl mx-auto mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0D284A]">Print Station</h1>
          <p className="text-gray-500">Staff View: {fullName}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border shadow-sm self-start sm:self-auto flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Filtered Items</span>
            <span className="text-lg font-bold text-cyan-600 font-mono">{filteredOrders.length}</span>
          </div>
          <div className="border-l pl-4">
            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Total Active Queue</span>
            <span className="text-lg font-bold text-[#0D284A] font-mono">{initialOrders.length}</span>
          </div>
        </div>
      </header>

      <StaffOrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        colorFilter={colorFilter}
        setColorFilter={setColorFilter}
        sidesFilter={sidesFilter}
        setSidesFilter={setSidesFilter}
      />

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Manager Notes</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const primaryItem = order.order_items?.[0];
                const isColor = primaryItem?.color_mode?.toLowerCase() === "full_color" || primaryItem?.color_mode?.toLowerCase() === "color";

                return (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 space-y-1.5">
                      <p className="font-bold text-[#0D284A] text-sm leading-tight">{order.order_name || "Untitled"}</p>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <p className="text-gray-400 font-mono">ID: #{order.id.slice(0, 8)}</p>
                        <p className="text-gray-500 font-medium">User: <span className="text-gray-700 font-semibold">{order.requester?.full_name || "Unknown"}</span></p>
                      </div>
                    </td>
                    <td className="p-4 space-y-2">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[11px] font-medium">{primaryItem?.service_type || "Standard Print"}</span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[11px] font-medium font-mono">{primaryItem?.paper_size || "A4"}</span>
                        <span className={`px-2 py-0.5 border rounded text-[11px] font-medium ${isColor ? "bg-pink-50 text-pink-700 border-pink-100 font-bold" : "bg-slate-100 text-slate-700 border-slate-200"}`}>{primaryItem?.color_mode?.replace('_', ' ') || "B&W"}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-medium">{primaryItem?.print_sides?.replace('_', '-') || "1-sided"}</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[11px] font-bold font-mono">Qty: x{primaryItem?.quantity || 1}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs max-w-[220px]">
                      {order.manager_notes ? <div className="bg-amber-50/40 border border-amber-100/70 p-2.5 rounded-xl text-amber-900 italic leading-normal">"{order.manager_notes}"</div> : <span className="text-gray-300 italic">No instructions</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : order.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {order.status?.replace('_', ' ') || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <button onClick={() => handleDownload(order)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm border transition-colors shadow-sm">💾</button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, order.status === 'approved' ? 'in_progress' : 'completed')}
                          disabled={loadingId === order.id || order.status === 'completed'}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${order.status === 'completed' ? "bg-gray-100 text-gray-400" : "bg-[#0D284A] text-white"}`}
                        >
                          {loadingId === order.id ? "..." : (order.status === 'approved' ? "Start" : "Complete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onConfirm={popup.onConfirm}
        onClose={() => setPopup(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}

