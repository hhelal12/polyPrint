"use client";

import Popup from "@/components/ui/Popup";
import FeedbackCard from "@/components/feedback/FeedbackCardd";
import { useFeedback } from "@/lib/hooks/useFeedback";

export default function StudentFeedbackPage() {
  const {
    completedOrders, loading, submittingId,
    ratings, setRatings,
    hoveredStars, setHoveredStars,
    comments, setComments,
    popupConfig, closePopup,
    handleSubmitFeedback,
  } = useFeedback();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-slate-500 text-xs font-medium gap-2">
        <span className="animate-spin">⏳</span> Loading review items...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-10">

      {/* ── Header ── */}
      <header className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D284A]">
          Order Feedback
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Items appear instantly when your order is completed — no refresh needed.
        </p>
      </header>

      {/* ── Empty state ── */}
      {completedOrders.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-slate-50/60 border border-slate-200/60 rounded-3xl shadow-inner">
          <span className="text-5xl block mb-4">🎉</span>
          <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs text-slate-400 mt-1">No completed orders are waiting for reviews.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {completedOrders.map((order) => {
            const currentRating = ratings[order.id] || 0;
            const hovered = hoveredStars[order.id] ?? null;
            const displayRating = hovered !== null ? hovered : currentRating;

            return (
              <FeedbackCard
                key={order.id}
                order={order}
                currentRating={currentRating}
                displayRating={displayRating}
                comment={comments[order.id] || ""}
                submittingId={submittingId}
                onRate={(star) => setRatings((p) => ({ ...p, [order.id]: star }))}
                onHover={(star) => setHoveredStars((p) => ({ ...p, [order.id]: star }))}
                onLeave={() => setHoveredStars((p) => ({ ...p, [order.id]: null }))}
                onCommentChange={(val) => setComments((p) => ({ ...p, [order.id]: val }))}
                onSubmit={() => handleSubmitFeedback(order.id)}
              />
            );
          })}
        </div>
      )}

      <Popup
        isOpen={popupConfig.isOpen}
        title={popupConfig.title}
        message={popupConfig.message}
        variant={popupConfig.variant}
        onClose={closePopup}
      />
    </div>
  );
}