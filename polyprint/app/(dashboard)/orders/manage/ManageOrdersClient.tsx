"use client";

import StaffOrderFilters from "@/components/orders/StaffOrderFilters";
import StaffHeader from "@/components/orders/staff/StaffHeader";
import StaffOrderCard from "@/components/orders/staff/StaffOrderCard";
import Popup from "@/components/ui/Popup";
import { useManageOrders, Order } from "@/lib/hooks/useManageOrders";

interface Props {
  fullName: string;
  initialOrders: Order[];
}

function getStatusStyle(status: string | null) {
  switch (status) {
    case "completed":   return "bg-green-50 text-green-700 border-green-200";
    case "in_progress": return "bg-amber-50 text-amber-700 border-amber-200";
    default:            return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default function ManageOrdersClient({ fullName, initialOrders = [] }: Props) {
  const {
    loadingId, popup, closePopup,
    searchQuery, setSearchQuery,
    colorFilter, setColorFilter,
    sidesFilter, setSidesFilter,
    filteredOrders, initialOrders: allOrders,
    handleDownload, handleStatusUpdate,
  } = useManageOrders(initialOrders);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-6">
      <div className="max-w-6xl mx-auto">

        <StaffHeader
          fullName={fullName}
          filteredCount={filteredOrders.length}
          totalCount={allOrders.length}
        />

        <StaffOrderFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          colorFilter={colorFilter}
          setColorFilter={setColorFilter}
          sidesFilter={sidesFilter}
          setSidesFilter={setSidesFilter}
        />

        {/* ── Mobile: card list ── */}
        <div className="flex flex-col gap-4 md:hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400 text-sm">
              No orders match your filters.
            </div>
          ) : filteredOrders.map((order) => (
            <StaffOrderCard
              key={order.id}
              order={order}
              loadingId={loadingId}
              onDownload={handleDownload}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>

        {/* ── Desktop: table ── */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-gray-200">
                <tr>
                  {["Order", "Details", "Manager Notes", "Status", "Actions"].map((h, i) => (
                    <th key={h} className={`p-4 text-xs font-bold text-gray-400 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">
                      No orders match your filters.
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => {
                  const item = order.order_items?.[0];
                  const isColor = item?.color_mode?.toLowerCase() === "full_color" || item?.color_mode?.toLowerCase() === "color";
                  const isCompleted = order.status === "completed";
                  const isLoading = loadingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 space-y-1.5">
                        <p className="font-bold text-[#0D284A] text-sm leading-tight">{order.order_name || "Untitled"}</p>
                        <p className="text-gray-400 font-mono text-xs">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">
                          By: <span className="font-semibold text-gray-700">{order.requester?.full_name || "Unknown"}</span>
                        </p>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[11px] font-medium">{item?.service_type || "Standard Print"}</span>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[11px] font-mono font-medium">{item?.paper_size || "A4"}</span>
                          <span className={`px-2 py-0.5 border rounded text-[11px] font-medium ${isColor ? "bg-pink-50 text-pink-700 border-pink-100" : "bg-slate-100 text-slate-700 border-slate-200"}`}>{item?.color_mode?.replace("_", " ") || "B&W"}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-medium">{item?.print_sides?.replace("_", "-") || "1-sided"}</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[11px] font-bold font-mono">Qty: x{item?.quantity || 1}</span>
                        </div>
                      </td>

                      <td className="p-4 text-xs max-w-[200px]">
                        {order.manager_notes
                          ? <div className="bg-amber-50/40 border border-amber-100/70 p-2.5 rounded-xl text-amber-900 italic leading-normal">"{order.manager_notes}"</div>
                          : <span className="text-gray-300 italic">No instructions</span>
                        }
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                          {order.status?.replace("_", " ") || "N/A"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          <button onClick={() => handleDownload(order)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm border transition-colors shadow-sm">💾</button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, order.status === "approved" ? "in_progress" : "completed")}
                            disabled={isLoading || isCompleted}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${isCompleted ? "bg-gray-100 text-gray-400" : "bg-[#0D284A] text-white hover:bg-[#0a1f3a]"}`}
                          >
                            {isLoading ? "..." : order.status === "approved" ? "Start" : "Complete"}
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

      </div>

      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onConfirm={popup.onConfirm}
        onClose={closePopup}
      />
    </div>
  );
}