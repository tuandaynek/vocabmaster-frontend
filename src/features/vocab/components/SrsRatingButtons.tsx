import type { ReviewRating } from "@/features/vocab/types";

interface SrsRatingButtonsProps {
  onReview: (rating: ReviewRating) => void;
  submitting: boolean;
}

const ratingMeta: Record<
  ReviewRating,
  { label: string; hint: string; className: string; buttonClassName: string; keyHint: string }
> = {
  again: {
    label: "Again",
    hint: "1 phút",
    keyHint: "[Phím 1]",
    className: "border-rose-500/20 bg-rose-950/20 hover:border-rose-500/40 text-rose-300",
    buttonClassName: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30",
  },
  hard: {
    label: "Hard",
    hint: "5 phút",
    keyHint: "[Phím 2]",
    className: "border-amber-500/20 bg-amber-950/20 hover:border-amber-500/40 text-amber-300",
    buttonClassName: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30",
  },
  good: {
    label: "Good",
    hint: "10 phút",
    keyHint: "[Phím 3]",
    className: "border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/40 text-emerald-300",
    buttonClassName: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
  },
  easy: {
    label: "Easy",
    hint: "1 ngày",
    keyHint: "[Phím 4]",
    className: "border-sky-500/20 bg-sky-950/20 hover:border-sky-500/40 text-sky-300",
    buttonClassName: "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30",
  },
};

export function SrsRatingButtons({ onReview, submitting }: SrsRatingButtonsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {(Object.entries(ratingMeta) as [ReviewRating, (typeof ratingMeta)[ReviewRating]][]).map(
        ([rating, meta]) => (
          <button
            key={rating}
            type="button"
            onClick={() => onReview(rating)}
            disabled={submitting}
            className={`rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-xl disabled:cursor-not-allowed disabled:opacity-60 ${meta.className}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`inline-flex rounded-xl px-3.5 py-1.5 text-sm font-bold ${meta.buttonClassName}`}
              >
                {meta.label}
              </div>
              <span className="text-xs font-semibold opacity-60">{meta.keyHint}</span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-300">{meta.hint}</p>
          </button>
        )
      )}
    </div>
  );
}