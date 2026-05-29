import React from "react";

interface FeedbackItemCardProps {
  item: {
    id: string;
    rating: number;
    comments?: string;
    created_at: string;
    order?: {
      id?: string;
      order_name?: string;
      requester?: {
        full_name?: string;
      };
    };
  };
}

export default function FeedbackItemCard({ item }: FeedbackItemCardProps) {
  const orderInfo = item.order || {};
  const studentName = orderInfo.requester?.full_name || "Anonymous Requester";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 flex flex-col justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-slate-200/60 min-w-0">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md inline-block mb-1">
              Order Key: #{orderInfo.id?.slice(0, 8) || "N/A"}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {orderInfo.order_name || "Untitled Request"}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Requester: <span className="font-semibold text-slate-700">{studentName}</span>
            </p>
          </div>

          <div className="bg-amber-50 text-amber-700 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 border border-amber-100 shrink-0">
            ⭐ {item.rating}
          </div>
        </div>

        {item.comments ? (
          <p className="bg-slate-50/70 p-3 rounded-xl border border-slate-100/60 text-slate-600 text-xs italic leading-relaxed break-words">
            "{item.comments}"
          </p>
        ) : (
          <p className="text-slate-300 text-xs italic pl-1">No additional commentary provided.</p>
        )}
      </div>

      <div className="border-t border-slate-50 pt-3 text-[10px] text-slate-400 flex justify-between items-center">
        <span>Logged Date</span>
        <span className="font-medium text-slate-500">
          {new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}