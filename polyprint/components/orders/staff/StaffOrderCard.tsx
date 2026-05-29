import { Order } from "@/lib/hooks/useManageOrders";

interface Props {
  order: Order;
  loadingId: string | null;
  onDownload: (order: Order) => void;
  onStatusUpdate: (id: string, next: "in_progress" | "completed") => void;
}

function getStatusStyle(status: string | null) {
  switch (status) {
    case "completed":  return "bg-green-50 text-green-700 border-green-200";
    case "in_progress": return "bg-amber-50 text-amber-700 border-amber-200";
    default:           return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default function StaffOrderCard({ order, loadingId, onDownload, onStatusUpdate }: Props) {
  const item = order.order_items?.[0];
  const isColor = item?.color_mode?.toLowerCase() === "full_color" || item?.color_mode?.toLowerCase() === "color";
  const nextStatus = order.status === "approved" ? "in_progress" : "completed";
  const isCompleted = order.status === "completed";
  const isLoading = loadingId === order.id;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">

      {/* ── Top: name + status ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0D284A] text-sm leading-tight truncate">
            {order.order_name || "Untitled"}
          </p>
          <p className="text-[11px] text-gray-400 font-mono mt-0.5">#{order.id.slice(0, 8)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            By: <span className="font-semibold text-gray-700">{order.requester?.full_name || "Unknown"}</span>
          </p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
          {order.status?.replace("_", " ") || "N/A"}
        </span>
      </div>

      {/* ── Print spec tags ── */}
      <div className="flex flex-wrap gap-1.5">
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[11px] font-medium">
          {item?.service_type || "Standard Print"}
        </span>
        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[11px] font-medium font-mono">
          {item?.paper_size || "A4"}
        </span>
        <span className={`px-2 py-0.5 border rounded text-[11px] font-medium ${isColor ? "bg-pink-50 text-pink-700 border-pink-100" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
          {item?.color_mode?.replace("_", " ") || "B&W"}
        </span>
        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-medium">
          {item?.print_sides?.replace("_", "-") || "1-sided"}
        </span>
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[11px] font-bold font-mono">
          Qty: x{item?.quantity || 1}
        </span>
      </div>

      {/* ── Manager notes ── */}
      {order.manager_notes ? (
        <div className="bg-amber-50/40 border border-amber-100/70 px-3 py-2 rounded-xl text-amber-900 text-xs italic leading-relaxed">
          "{order.manager_notes}"
        </div>
      ) : (
        <p className="text-xs text-gray-300 italic">No manager instructions</p>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onDownload(order)}
          className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm border transition-colors shadow-sm"
        >
          💾
        </button>
        <button
          onClick={() => onStatusUpdate(order.id, nextStatus)}
          disabled={isLoading || isCompleted}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
            isCompleted ? "bg-gray-100 text-gray-400" : "bg-[#0D284A] text-white hover:bg-[#0a1f3a]"
          }`}
        >
          {isLoading ? "Updating..." : order.status === "approved" ? "Start Printing" : "Mark Complete"}
        </button>
      </div>
    </div>
  );
}