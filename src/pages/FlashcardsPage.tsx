import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabApi } from "@/features/vocab/api/vocabApi";
import type { ReviewRating, UserVocabularyItem } from "@/features/vocab/types";
import { FlashcardItem } from "@/features/vocab/components/FlashcardItem";
import { SrsRatingButtons } from "@/features/vocab/components/SrsRatingButtons";
import { useRating } from "@/contexts/RatingContext";

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { openRating } = useRating();

  const [cards, setCards] = useState<UserVocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const currentCard = cards[currentIndex] ?? null;
  const totalCards = cards.length;
  const progressPercent =
    totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  const fetchDueCards = async () => {
    try {
      setLoading(true);
      setError("");
      setCompleted(false);
      const response = await vocabApi.getDueCards();
      const dueCards = response?.data || [];
      setCards(dueCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error("Failed to load due cards:", err);
      setError("Không thể tải danh sách thẻ ôn tập. Vui lòng thử lại.");
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueCards();
  }, []);

  const handleReview = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard || submitting) return;

      try {
        setSubmitting(true);
        setError("");

        // 1. Gọi API gửi kết quả SRS
        await vocabApi.reviewCard({ user_vocab_id: currentCard.id, rating });

        // 2. Lật thẻ về mặt trước trước
        setIsFlipped(false);

        openRating({
          feature: "Flashcards",
          title: "Đánh giá trải nghiệm ôn tập từ vựng",
          description:
            "Cảm ơn bạn đã hoàn thành bài học hôm nay! Chúng tôi rất mong nhận được phản hồi của bạn để cải thiện trải nghiệm ôn tập từ vựng.",
          fastComments: [
            "SRS hoạt động tốt",
            "Giao diện trực quan",
            "Cần cải thiện thêm",
          ],

          onClose: () => {
            // 3. Đợi 300ms cho animation lật thẻ úp lại mặt trước hoàn tất rồi mới đổi data card
            setTimeout(() => {
              const nextCards = cards.filter(
                (card) => card.id !== currentCard.id,
              );
              setCards(nextCards);

              if (nextCards.length === 0) {
                setCompleted(true);
                setCurrentIndex(0);
              } else {
                setCurrentIndex(0);
              }

              // Mở lại tương tác sau khi đã nạp card mới xong
              setSubmitting(false);
            }, 300);
          },
        });
      } catch (err) {
        console.error("Failed to review card:", err);
        setError("Cập nhật kết quả ôn tập thất bại. Vui lòng thử lại.");
        setSubmitting(false);
      }
      // LƯU Ý: Đã chuyển setSubmitting(false) vào trong setTimeout & catch, bỏ ở finally để tránh mở lại button quá sớm.
    },
    [currentCard, submitting, cards],
  );

  // Xử lý phím tắt Space & 1-4
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentCard || submitting) return;
      // Ngăn chặn thao tác khi đang focus vào input hoặc textarea (ví dụ khi user đang nhập comment)
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
        return;
      }

      if (isFlipped) {
        if (event.code === "Digit1" || event.code === "Numpad1")
          handleReview("again");
        else if (event.code === "Digit2" || event.code === "Numpad2")
          handleReview("hard");
        else if (event.code === "Digit3" || event.code === "Numpad3")
          handleReview("good");
        else if (event.code === "Digit4" || event.code === "Numpad4")
          handleReview("easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, submitting, isFlipped, handleReview]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 text-slate-600">
        <div className="relative space-y-4 rounded-3xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
          <p className="text-base font-bold tracking-wide text-slate-700">Đang tải thẻ ôn tập...</p>
        </div>
      </div>
    );
  }

  if (completed || (!loading && cards.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
        <div className="relative w-full max-w-xl rounded-3xl border-2 border-emerald-100 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800">
            🎉 Hoàn thành bài học hôm nay!
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Tuyệt vời! Bạn đã ôn xong tất cả thẻ đang đến hạn trong ngày.
          </p>
          <button
            type="button"
            onClick={fetchDueCards}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-8 py-3.5 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
          >
            <Sparkles className="h-4 w-4" /> Ôn tập tiếp
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 px-4 py-10 text-slate-800 sm:py-12">
      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate("/vocab")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              aria-label="Back to vocab"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Flashcards SRS</span>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-800">Ôn tập từ vựng</h1>
            </div>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-extrabold text-amber-700 shadow-sm">
            Thẻ {Math.min(currentIndex + 1, totalCards)} / {totalCards}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Tiến độ học</span>
            <span className="text-emerald-700">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Flashcard Component */}
        <FlashcardItem
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          submitting={submitting}
        />

        {/* SRS Action Buttons */}
        {isFlipped && (
          <SrsRatingButtons onReview={handleReview} submitting={submitting} />
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
