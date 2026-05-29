import StarRating from "./StarRating";

interface Props {
  order: any;
  currentRating: number;
  displayRating: number;
  comment: string;
  submittingId: string | null;
  onRate: (star: number) => void;
  onHover: (star: number) => void;
  onLeave: () => void;
  onCommentChange: (val: string) => void;
  onSubmit: () => void;
}

export default function FeedbackCard({
  order,
  currentRating,
  displayRating,
  comment,
  submittingId,
  onRate,
  onHover,
  onLeave,
  onCommentChange,
  onSubmit,
}: Props) {
  const isSubmitting = submittingId === order.id;

  return (
    <div
      className={`bg-white border rounded-2xl p-4 sm:p-6 flex flex-col gap-4 transition-all duration-200 ${
        currentRating > 0 ? "border-cyan-500/20 bg-cyan-50/5" : "border-slate-100"
      }`}
    >
      {/* ── Order info ── */}
      <div>
        <h3 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
          {order.order_name || "Untitled Request"}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <p className="text-xs text-slate-500">
            Type:{" "}
            <span className="font-semibold text-slate-800">
              {order.order_items?.[0]?.service_type || "Standard Printing"}
            </span>
          </p>
          <span className="text-slate-300 text-xs hidden sm:inline">•</span>
          <p className="text-xs text-slate-500">
            Total:{" "}
            <span className="font-mono font-bold text-cyan-600 bg-cyan-50 border border-cyan-100/50 px-2 py-0.5 rounded-lg">
              BHD {(Number(order.total_price) || 0).toFixed(3)}
            </span>
          </p>
        </div>
      </div>

      {/* ── Stars ── */}
      <StarRating
        orderId={order.id}
        currentRating={currentRating}
        displayRating={displayRating}
        onRate={onRate}
        onHover={onHover}
        onLeave={onLeave}
      />

      {/* ── Comment + submit ── */}
      <div className="flex flex-col gap-3 bg-slate-50/40 p-3 sm:p-4 rounded-xl border border-slate-100">
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Comments regarding quality..."
          className="w-full p-3 text-xs border rounded-xl bg-white resize-none focus:outline-none focus:border-slate-400 text-slate-700"
        />
        <button
          type="button"
          disabled={isSubmitting || !currentRating}
          onClick={onSubmit}
          className={`w-full py-3 rounded-xl text-xs font-extrabold text-white transition-all ${
            !currentRating
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-[#0D284A] hover:bg-slate-800"
          }`}
        >
          {isSubmitting ? "Saving..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}