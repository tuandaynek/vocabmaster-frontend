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
    className: "border-rose-200 border-b-4 bg-rose-50 text-rose-700 hover:border-rose-300",
    buttonClassName: "bg-rose-500 text-white",
  },
  hard: {
    label: "Hard",
    hint: "5 phút",
    keyHint: "[Phím 2]",
    className: "border-amber-200 border-b-4 bg-amber-50 text-amber-800 hover:border-amber-300",
    buttonClassName: "bg-amber-400 text-amber-950",
  },
  good: {
    label: "Good",
    hint: "10 phút",
    keyHint: "[Phím 3]",
    className: "border-emerald-200 border-b-4 bg-emerald-50 text-emerald-800 hover:border-emerald-300",
    buttonClassName: "bg-emerald-500 text-white",
  },
  easy: {
    label: "Easy",
    hint: "1 ngày",
    keyHint: "[Phím 4]",
    className: "border-sky-200 border-b-4 bg-sky-50 text-sky-800 hover:border-sky-300",
    buttonClassName: "bg-sky-400 text-white",
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
            className={`rounded-3xl border-2 p-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-md active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-60 ${meta.className}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`inline-flex rounded-xl px-3.5 py-1.5 text-sm font-extrabold ${meta.buttonClassName}`}
              >
                {meta.label}
              </div>
              <span className="text-xs font-semibold opacity-60">{meta.keyHint}</span>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-600">{meta.hint}</p>
          </button>
        )
      )}
    </div>
  );
}