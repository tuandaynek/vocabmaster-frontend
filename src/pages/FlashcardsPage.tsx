import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { vocabApi } from "@/features/vocab/api/vocabApi";
import type { ReviewRating, UserVocabularyItem } from "@/features/vocab/types";
import { FlashcardItem } from "@/features/vocab/components/FlashcardItem";
import { SrsRatingButtons } from "@/features/vocab/components/SrsRatingButtons";

export default function FlashcardsPage() {
  const navigate = useNavigate();
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

        // 3. Đợi 300ms cho animation lật thẻ úp lại mặt trước hoàn tất rồi mới đổi data card
        setTimeout(() => {
          const nextCards = cards.filter((card) => card.id !== currentCard.id);
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
          <p className="text-lg font-semibold">Đang tải thẻ ôn tập...</p>
        </div>
      </div>
    );
  }

  if (completed || (!loading && cards.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            🎉 Hoàn thành bài học hôm nay!
          </h1>
          <p className="mt-3 text-slate-600">
            Bạn đã ôn xong tất cả thẻ đang đến hạn.
          </p>
          <button
            type="button"
            onClick={fetchDueCards}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" /> Ôn tập tiếp
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-600">
                Flashcards SRS
              </p>
              <h1 className="text-3xl font-bold">Ôn tập từ vựng</h1>
            </div>
          </div>
          <div className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
            Thẻ {Math.min(currentIndex + 1, totalCards)} / {totalCards}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Tiến độ học</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
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
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
