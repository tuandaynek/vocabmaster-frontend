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
    className: "border-red-200 bg-red-50 text-red-700",
    buttonClassName: "bg-red-500 hover:bg-red-600 text-white",
  },
  hard: {
    label: "Hard",
    hint: "5 phút",
    keyHint: "[Phím 2]",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    buttonClassName: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  good: {
    label: "Good",
    hint: "10 phút",
    keyHint: "[Phím 3]",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    buttonClassName: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  easy: {
    label: "Easy",
    hint: "1 ngày",
    keyHint: "[Phím 4]",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    buttonClassName: "bg-sky-500 hover:bg-sky-600 text-white",
  },
};

export function SrsRatingButtons({ onReview, submitting }: SrsRatingButtonsProps) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {(Object.entries(ratingMeta) as [ReviewRating, (typeof ratingMeta)[ReviewRating]][]).map(
        ([rating, meta]) => (
          <button
            key={rating}
            type="button"
            onClick={() => onReview(rating)}
            disabled={submitting}
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${meta.className}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`inline-flex rounded-xl px-3 py-1.5 text-sm font-bold text-white ${meta.buttonClassName}`}
              >
                {meta.label}
              </div>
              <span className="text-xs font-semibold opacity-70">{meta.keyHint}</span>
            </div>
            <p className="mt-2 text-xs font-medium">{meta.hint}</p>
          </button>
        )
      )}
    </div>
  );
}