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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md scale-100 rounded-[32px] bg-slate-900 p-7 shadow-2xl border border-slate-800 text-slate-100 transition-all animate-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-2xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="py-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
              <Check className="h-7 w-7 stroke-[2.5]" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-white tracking-tight">
              Cảm ơn phản hồi tuyệt vời của bạn!
            </h3>
            <p className="mt-1.5 text-sm text-slate-400">
              Đóng góp của bạn giúp hệ thống ngày càng hoàn thiện hơn.
            </p>
          </div>
        ) : (
          <>
            {/* Header động */}
            <div className="text-center pr-6 pl-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-3">
                <span>Góp ý dịch vụ</span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
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
                        : "text-slate-700 group-hover:text-slate-500"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Phần hiển thị tags & textarea khi đã chọn sao */}
            {rating > 0 && (
              <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 border-t border-slate-800 pt-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
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
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                              : "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900"
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Ý kiến chi tiết (tùy chọn):</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Hãy chia sẻ thêm chi tiết để chúng mình cải thiện nhé..."
                    rows={2.5}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-slate-600"
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
                className="w-1/2 rounded-2xl h-12 border-slate-800 bg-slate-900 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Bỏ qua
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-1/2 rounded-2xl h-12 bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-90 disabled:opacity-50 transition-all"
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
