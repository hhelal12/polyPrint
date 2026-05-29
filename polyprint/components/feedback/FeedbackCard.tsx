interface FeedbackCardProps {
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

export default function FeedbackCard({ item }: FeedbackCardProps) {
  const orderInfo = item.order || {};
  const studentName = orderInfo.requester?.full_name || "Anonymous Student";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-4 md:gap-6 items-start md:items-center transition-all duration-200 shadow-sm hover:shadow-md/5">
      <div className="flex-1 space-y-2 w-full min-w-0">
        <div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md inline-block mb-1">
            Order #{orderInfo.id?.slice(0, 8) || "N/A"}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
            {orderInfo.order_name || "Untitled Request"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Fulfilled for: <span className="font-semibold text-slate-700">{studentName}</span>
          </p>
        </div>

        {item.comments && (
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-slate-700 text-xs italic break-words">
            "{item.comments}"
          </div>
        )}
      </div>

      {/* Read-Only Star Rating Display Layout */}
      <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end bg-slate-50/70 md:bg-transparent p-3 md:p-0 rounded-xl gap-1 shrink-0">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg 
              key={star} 
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                star <= item.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-transparent stroke-[1.5]"
              }`} 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.39 1.137-.39 1.288 0l2.622 6.772a1 1 0 00.942.684l7.19.645c.42.038.587.553.27.846l-5.467 5.06a1 1 0 00-.288.887l1.59 7.026c.093.41-.334.721-.692.5l-6.223-3.79a1 1 0 00-.964 0l-6.223 3.79c-.358.22-.785-.09-.692-.5l1.59-7.026a1 1 0 00-.288-.887l-5.467-5.06c-.317-.294-.15-.81.27-.846l7.19-.645a1 1 0 00.942-.684l2.622-6.772z" />
            </svg>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {new Date(item.created_at).toLocaleDateString('en-GB')}
        </span>
      </div>
    </div>
  );
}