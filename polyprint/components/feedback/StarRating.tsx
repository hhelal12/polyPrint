interface Props {
  orderId: string;
  currentRating: number;
  displayRating: number;
  onRate: (star: number) => void;
  onHover: (star: number) => void;
  onLeave: () => void;
}

export default function StarRating({ currentRating, displayRating, onRate, onHover, onLeave }: Props) {
  return (
    <div
      className="inline-flex items-center gap-0.5 sm:gap-1 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100"
      onMouseLeave={onLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          className="p-0.5 sm:p-1 focus:outline-none transition-transform active:scale-90"
        >
          <svg
            className={`w-7 h-7 sm:w-9 sm:h-9 transition-colors duration-150 ${
              star <= (displayRating ?? 0)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300 fill-transparent stroke-[1.5]"
            }`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499c.151-.39 1.137-.39 1.288 0l2.622 6.772a1 1 0 00.942.684l7.19.645c.42.038.587.553.27.846l-5.467 5.06a1 1 0 00-.288.887l1.59 7.026c.093.41-.334.721-.692.5l-6.223-3.79a1 1 0 00-.964 0l-6.223 3.79c-.358.22-.785-.09-.692-.5l1.59-7.026a1 1 0 00-.288-.887l-5.467-5.06c-.317-.294-.15-.81.27-.846l7.19-.645a1 1 0 00.942-.684l2.622-6.772z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}