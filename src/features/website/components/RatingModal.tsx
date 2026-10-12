import { useState } from "react";
import { Star, X, MessageSquare, Check} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  fastComments?: string[];
  onSubmitRating: (data: {
    rating: number;
    fastComments: string[];
    comment: string;
  }) => Promise<void> | void;
}

const DEFAULT_TAGS = [
  "Rất chính xác",
  "Tốc độ phản hồi nhanh",
  "Giao diện trực quan",
  "Kết quả chưa sát",
  "Cần cải thiện thêm",
];

export function RatingModal({
  isOpen,
  onClose,
  title = "Đánh giá trải nghiệm AI",
  description = "Trải nghiệm tính năng này của bạn thế nào?",
  fastComments = DEFAULT_TAGS,
  onSubmitRating,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      setIsSubmitting(true);
      await onSubmitRating({ rating, fastComments: selectedTags, comment });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setSelectedTags([]);
        setComment("");
        onClose();
      }, 1600);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md scale-100 rounded-3xl border-2 border-slate-100 bg-white p-7 text-slate-800 shadow-xl transition-all animate-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng đánh giá"
          className="absolute right-5 top-5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-2 text-slate-600 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="py-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Check className="h-7 w-7 stroke-[2.5]" />
            </div>
            <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-800">
              Cảm ơn phản hồi tuyệt vời của bạn!
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Đóng góp của bạn giúp hệ thống ngày càng hoàn thiện hơn.
            </p>
          </div>
        ) : (
          <>
            {/* Header động */}
            <div className="text-center pr-6 pl-6">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800">
                <span>Góp ý dịch vụ</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-slate-800">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>

            {/* Chọn Sao Interactive */}
            <div className="my-6 flex justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="group relative p-1.5 transition-transform duration-150 hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`h-9 w-9 transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400 drop-shadow-md"
                        : "text-slate-300 group-hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Phần hiển thị tags & textarea khi đã chọn sao */}
            {rating > 0 && (
              <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 border-t-2 border-slate-100 pt-5">
                <div>
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Nhận xét nhanh:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fastComments.map((comment) => {
                      const isSelected = selectedTags.includes(comment);
                      return (
                        <button
                          key={comment}
                          type="button"
                          onClick={() => toggleTag(comment)}
                          className={`rounded-2xl px-3.5 py-2 text-xs font-semibold transition-all shadow-sm ${
                            isSelected
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                                : "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {comment}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea Góp ý */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Ý kiến chi tiết (tùy chọn):</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Hãy chia sẻ thêm chi tiết để chúng mình cải thiện nhé..."
                    rows={2.5}
                    className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white p-3.5 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            )}

            {/* Buttons Action */}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-12 w-1/2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              >
                Bỏ qua
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="h-12 w-1/2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
