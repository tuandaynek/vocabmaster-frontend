import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Home, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";
import { collocationApi } from "@/features/collocations/api/collocationApi";
import type { CollocationReviewData } from "@/features/collocations/types";
import Phase1Shadowing from "../features/collocations/components/Phase1Shadowing";
import Phase2BaseSentence from "./../features/collocations/components/Phase2BaseSentence";
import Phase3VariationPractice from "@/features/collocations/components/Phase3VariationPractice";

export default function ReviewCollocation() {
  const { collocationId } = useParams<{ collocationId: string }>();
  const navigate = useNavigate();

  const [collocation, setCollocation] = useState<CollocationReviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [isCompletedAll, setIsCompletedAll] = useState<boolean>(false);

  useEffect(() => {
    const fetchCollocationData = async () => {
      if (!collocationId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await collocationApi.getReview(collocationId);
        setCollocation(data);
      } catch (err: any) {
        console.error("Failed to fetch collocation review:", err);
        const errorMsg =
          err?.data?.message || err?.message || "Không thể tải dữ liệu bài học";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    void fetchCollocationData();
  }, [collocationId]);

  const triggerLightConfetti = () => {
    // Pháo hoa nhẹ nhàng
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#8b5cf6", "#ec4899", "#3b82f6"],
        disableForReducedMotion: true,
      });
    } catch {
      // Bỏ qua nếu chưa cài package canvas-confetti
    }
  };

  const handlePhaseComplete = async () => {
    if (currentPhase === 1) {
      toast.success("Hoàn thành Phase 1! Chuyển sang Phase 2.");
      setCurrentPhase(2);
    } else if (currentPhase === 2) {
      toast.success("Hoàn thành Phase 2! Chuẩn bị Luyện biến thể.");
      setCurrentPhase(3);
    } else if (currentPhase === 3) {
      if (!collocation) return;

      const targetId = collocation.collocationId || collocation.id;

      try {
        await collocationApi.completePhase3(targetId, "good");

        // Bật popup chúc mừng & bắn pháo hoa nhẹ
        setIsCompletedAll(true);
        triggerLightConfetti();

        // Chờ 2s cho user xem popup chúc mừng trước khi redirect
        setTimeout(() => {
          navigate("/collocation/review");
        }, 2200);
      } catch (err) {
        console.error("Lỗi khi lưu tiến trình:", err);
        toast.error("Không thể lưu tiến trình bài học");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="text-slate-600 font-medium text-sm">
            Đang tải bài luyện tập...
          </p>
        </div>
      </div>
    );
  }

  if (error || !collocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-red-500 font-medium">
          {error || "Không tìm thấy dữ liệu"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 relative">
      {/* Top Bar: Nút Back & Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Phase Dots */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          {[1, 2, 3].map((phase) => (
            <div
              key={phase}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentPhase === phase
                  ? "w-8 bg-violet-600"
                  : currentPhase > phase
                  ? "w-2.5 bg-emerald-500"
                  : "w-2.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Phases */}
      <div className="max-w-4xl mx-auto">
        {currentPhase === 1 && (
          <Phase1Shadowing
            collocation={collocation}
            onComplete={handlePhaseComplete}
          />
        )}

        {currentPhase === 2 && (
          <Phase2BaseSentence
            collocation={collocation}
            onComplete={handlePhaseComplete}
          />
        )}

        {currentPhase === 3 && (
          <Phase3VariationPractice
            collocation={collocation}
            onComplete={handlePhaseComplete}
          />
        )}
      </div>

      {/* Overlay Chúc mừng nhẹ nhàng khi hoàn thành bài */}
      {isCompletedAll && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-1.5">
              Xuất sắc! <PartyPopper className="w-5 h-5 text-violet-500" />
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Bạn đã hoàn thành bài luyện tập cho cụm từ{" "}
              <span className="font-semibold text-violet-600">
                "{collocation.phrase}"
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Đang quay về danh sách ôn tập...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}