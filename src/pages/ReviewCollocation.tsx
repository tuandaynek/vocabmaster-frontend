import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {  useRating } from "@/contexts/RatingContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  PartyPopper,
  Flame,
  Sparkles,
  Bot,
  Lightbulb,
  Trophy,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { collocationApi } from "@/features/collocations/api/collocationApi";
import type { CollocationReviewData } from "@/features/collocations/types";

// Passive Drill Components (Step 0)
import Phase1Shadowing from "@/features/collocations/components/Phase1Shadowing";
import Phase2BaseSentence from "@/features/collocations/components/Phase2BaseSentence";
import Phase3VariationPractice from "@/features/collocations/components/Phase3VariationPractice";

// Active Recall Components (Step >= 1)
import Phase1Translation from "@/features/collocations/components/Phase1Translation";
import Phase2FreeSentence from "@/features/collocations/components/Phase2FreeSentence";
import Phase3ShortStory from "@/features/collocations/components/Phase3ShortStory";

export default function ReviewCollocation() {
  const { collocationId } = useParams<{ collocationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { openRating } = useRating();

  // Đọc step từ router state (nếu có)
  const initialStepFromState = (location.state as { step?: number } | null)
    ?.step;

  const [collocation, setCollocation] = useState<CollocationReviewData | null>(
    null,
  );
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

  // Xác định step chính xác: ưu tiên Router State, nếu không có thì lấy từ API data
  const currentStep =
    initialStepFromState ??
    (collocation as any)?.step ??
    (collocation as any)?.user_step ??
    0;

  const triggerLightConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"],
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
      toast.success("Hoàn thành Phase 2! Chuyển sang Phase 3.");
      setCurrentPhase(3);
    } else if (currentPhase === 3) {
      if (!collocation) return;

      const targetId = collocation.collocationId || collocation.id;

      try {
        await collocationApi.completeReview(targetId, "good");

        setIsCompletedAll(true);
        triggerLightConfetti();

        openRating({
          feature: "Collocation Review",
          title: "Đánh giá trải nghiệm luyện tập",
          description:
            "Cảm ơn bạn đã hoàn thành bài luyện tập! Hãy cho chúng tôi biết trải nghiệm của bạn.",
          fastComments: [
            "Phương pháp luyện tập hữu ích",
            "Giao diện trực quan, dễ sử dụng",
            "AI phản hồi chưa chính xác",
            "Cần cải thiện thêm tính năng",
          ],

          onClose: () => {
            setTimeout(() => {
              navigate("/collocation/review");
            }, 1500);
          }
        });

      } catch (err) {
        console.error("Lỗi khi lưu tiến trình:", err);
        toast.error("Không thể lưu tiến trình bài học");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 text-slate-600">
        <div className="relative flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
          <p className="text-sm font-bold tracking-wide text-slate-700">
            Đang tải không gian luyện tập...
          </p>
        </div>
      </div>
    );
  }

  if (error || !collocation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-slate-50 p-4">
        <div className="relative w-full max-w-sm rounded-3xl border-2 border-rose-200 bg-white p-8 text-center shadow-sm">
          <p className="mb-6 text-base font-bold text-rose-700">
            {error || "Không tìm thấy dữ liệu bài học"}
          </p>
          <button
            onClick={() => navigate("/vocab")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
          >
            <Home className="w-4 h-4" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isActiveMode = currentStep >= 1;

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-800">
      {/* Top Header Bar */}
      <header className="relative z-10 mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-slate-100 bg-white px-5 py-4 shadow-sm sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/vocab")}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          Quay lại
        </button>

        {/* Phase Progress Segmented Bar */}
        <div className="flex-1 max-w-md mx-2 flex items-center gap-3">
          <div className="grid flex-1 grid-cols-3 gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50 p-2">
            {[1, 2, 3].map((phase) => (
              <div
                key={phase}
                className={`h-2.5 rounded-xl transition-all duration-300 ${
                  currentPhase === phase
                    ? "bg-sky-400"
                    : currentPhase > phase
                    ? "bg-emerald-500"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="shrink-0 text-xs font-bold text-slate-500">
            Phase <strong className="text-slate-800">{currentPhase}</strong>/3
          </span>
        </div>

        {/* Mode & Streak Badge */}
        <div className="flex items-center gap-3">
          {isActiveMode && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700">
              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              SRS Step {currentStep}
            </span>
          )}
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-extrabold text-orange-600 shadow-sm">
            <Flame className="h-4 w-4 animate-bounce fill-orange-500 text-orange-500" />
            <span>5 Ngày Streak</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <main className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* CỘT TRÁI: BÀI LUYỆN TẬP CHÍNH */}
        <div className="w-full lg:col-span-8">
          <div className="w-full transition-all duration-300">
            {!isActiveMode ? (
              <>
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
              </>
            ) : (
              <>
                {currentPhase === 1 && (
                  <Phase1Translation
                    collocation={collocation}
                    onNext={handlePhaseComplete}
                  />
                )}
                {currentPhase === 2 && (
                  <Phase2FreeSentence
                    collocation={collocation}
                    onNext={handlePhaseComplete}
                  />
                )}
                {currentPhase === 3 && (
                  <Phase3ShortStory
                    collocation={collocation}
                    onComplete={handlePhaseComplete}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: SIDEBAR (STICKY) */}
        <div className="w-full space-y-4 lg:sticky lg:top-6 lg:col-span-4">
          {/* Card 1: Mascot Assistant */}
          <div className="flex items-start gap-3.5 rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
              <Bot className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                <Sparkles className="w-3.5 h-3.5" /> Trợ lý AI
              </div>
              <h4 className="text-xs font-bold text-slate-800">
                {!isActiveMode ? (
                  <>
                    {currentPhase === 1 && "Luyện phát âm chuẩn nhịp"}
                    {currentPhase === 2 && "Luyện đọc tròn vành rõ chữ"}
                    {currentPhase === 3 && "Phản xạ câu biến thể"}
                  </>
                ) : (
                  <>
                    {currentPhase === 1 && "Dịch thuật Active Recall"}
                    {currentPhase === 2 && "Tự đặt câu tự do"}
                    {currentPhase === 3 && "Sáng tác mẩu chuyện"}
                  </>
                )}
              </h4>
              <p className="pt-0.5 text-xs leading-relaxed text-slate-500">
                {!isActiveMode ? (
                  <>
                    {currentPhase === 1 && "Nhại giọng bản xứ để tăng phản xạ ghi nhớ."}
                    {currentPhase === 2 && "Đặt cụm từ vào ngữ cảnh câu hoàn chỉnh."}
                    {currentPhase === 3 && "Linh hoạt thay đổi cấu trúc ngữ pháp."}
                  </>
                ) : (
                  <>
                    {currentPhase === 1 && "Kích hoạt phản xạ xuôi/ngược bằng dịch trực tiếp."}
                    {currentPhase === 2 && "Sáng tạo câu riêng với AI chấm điểm trực tiếp."}
                    {currentPhase === 3 && "Kết nối ngữ cảnh đoạn văn ở mức nâng cao."}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Card 2: Academic IELTS Tip Widget */}
          <div className="space-y-1.5 rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              <Lightbulb className="h-4 w-4 fill-amber-400 text-amber-600" /> IELTS Tip
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-600">
              Dùng cụm{" "}
              <strong className="font-bold text-amber-800 underline">
                {collocation.phrase}
              </strong>{" "}
              sẽ giúp tăng điểm Lexical Resource rõ rệt!
            </p>
          </div>

          {/* Card 3: Phase Overview Badge */}
          <div className="flex items-center justify-between rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 font-bold text-amber-700">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Mục tiêu
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-800">
                  {isActiveMode ? "Active Recall" : "Passive Drill"}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">
              +15 XP
            </span>
          </div>
        </div>
      </main>

      {/* Overlay Chúc mừng hoàn thành */}
      {isCompletedAll && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm fade-in duration-300">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-emerald-100 bg-white p-8 text-center shadow-xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight text-slate-800">
              Xuất sắc! <PartyPopper className="h-6 w-6 text-amber-500" />
            </h3>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Bạn đã hoàn thành trọn vẹn cả 3 Phase cho cụm từ{" "}
              <span className="font-bold text-emerald-700 underline">
                &ldquo;{collocation.phrase}&rdquo;
              </span>
            </p>
            <div className="border-t-2 border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500">
                🚀 Đang chuyển hướng về trang danh sách...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
