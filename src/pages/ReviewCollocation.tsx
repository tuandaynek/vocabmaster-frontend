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
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-300 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
          <p className="text-slate-200 font-bold text-sm tracking-wide">
            Đang tải không gian luyện tập...
          </p>
        </div>
      </div>
    );
  }

  if (error || !collocation) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4 p-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative bg-slate-900/60 border border-rose-500/30 p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl backdrop-blur-xl">
          <p className="text-rose-400 font-bold text-base mb-6">
            {error || "Không tìm thấy dữ liệu bài học"}
          </p>
          <button
            onClick={() => navigate("/vocab")}
            className="w-full py-3 px-4 text-sm font-bold bg-slate-800 text-slate-200 rounded-2xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 shadow-lg"
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
    <div className="relative min-h-screen bg-slate-950 py-8 px-4 text-slate-100 overflow-hidden">
      {/* Hiệu ứng ánh sáng nền Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-sky-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-5xl mx-auto mb-8 bg-slate-900/60 border border-slate-800/80 px-6 py-4 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between gap-4 relative z-10">
        <button
          onClick={() => navigate("/vocab")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800/60 border border-slate-700/60 rounded-2xl hover:bg-slate-800 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          Quay lại
        </button>

        {/* Phase Progress Segmented Bar */}
        <div className="flex-1 max-w-md mx-2 flex items-center gap-3">
          <div className="flex-1 grid grid-cols-3 gap-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            {[1, 2, 3].map((phase) => (
              <div
                key={phase}
                className={`h-2.5 rounded-xl transition-all duration-300 ${
                  currentPhase === phase
                    ? "bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
                    : currentPhase > phase
                    ? "bg-emerald-500"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-400 shrink-0">
            Phase <strong className="text-white">{currentPhase}</strong>/3
          </span>
        </div>

        {/* Mode & Streak Badge */}
        <div className="flex items-center gap-3">
          {isActiveMode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs shrink-0">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              SRS Step {currentStep}
            </span>
          )}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-2xl text-amber-400 font-bold text-xs shadow-sm shrink-0">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
            <span>5 Ngày Streak</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* CỘT TRÁI: BÀI LUYỆN TẬP CHÍNH */}
        <div className="lg:col-span-8 w-full">
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
        <div className="lg:col-span-4 space-y-4 w-full lg:sticky lg:top-6">
          {/* Card 1: Mascot Assistant */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-xl flex items-start gap-3.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 border border-sky-400/30 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Trợ lý AI
              </div>
              <h4 className="font-bold text-white text-xs">
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
              <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
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
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-4 text-white shadow-xl border border-purple-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] tracking-wider uppercase">
              <Lightbulb className="w-4 h-4 fill-amber-300" /> IELTS Tip
            </div>
            <p className="text-xs text-purple-100 font-medium leading-relaxed">
              Dùng cụm{" "}
              <strong className="text-amber-300 underline font-bold">
                {collocation.phrase}
              </strong>{" "}
              sẽ giúp tăng điểm Lexical Resource rõ rệt!
            </p>
          </div>

          {/* Card 3: Phase Overview Badge */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mục tiêu
                </p>
                <p className="text-xs font-bold text-white mt-0.5">
                  {isActiveMode ? "Active Recall" : "Passive Drill"}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
              +15 XP
            </span>
          </div>
        </div>
      </main>

      {/* Overlay Chúc mừng hoàn thành */}
      {isCompletedAll && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-slate-900 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl border border-emerald-500/30 animate-in zoom-in-95 duration-300 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
              Xuất sắc! <PartyPopper className="w-6 h-6 text-purple-400" />
            </h3>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              Bạn đã hoàn thành trọn vẹn cả 3 Phase cho cụm từ{" "}
              <span className="font-bold text-purple-400 underline">
                &ldquo;{collocation.phrase}&rdquo;
              </span>
            </p>
            <div className="pt-3 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400">
                🚀 Đang chuyển hướng về trang danh sách...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
