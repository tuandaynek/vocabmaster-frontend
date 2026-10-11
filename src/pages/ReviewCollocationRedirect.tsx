import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collocationApi } from "@/features/collocations/api/collocationApi";
import { toast } from "sonner";
import { CheckCircle2, Home, BookOpen, Sparkles } from "lucide-react";

export default function ReviewCollocationRedirect() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [noData, setNoData] = useState<boolean>(false);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setLoading(true);
        const response = await collocationApi.getUserList();
        const userList = response?.data ?? [];
        const now = new Date();

        // 1. Kiểm tra từ cần review (next_review <= now)
        const dueItem = userList.find(
          (item) => item.collocation_id && new Date(item.next_review) <= now
        );

        if (dueItem?.collocation_id) {
          const itemStep = (dueItem as any).step ?? (dueItem as any).user_step ?? 0;
          navigate(`/collocation/review/${dueItem.collocation_id}`, {
            replace: true,
            state: { step: itemStep },
          });
          return;
        }

        // 2. Nếu chưa có từ nào tới hạn review, lấy từ đang trong tiến trình (chưa mastered)
        const learningItem = userList.find(
          (item) => item.collocation_id && item.status !== "mastered"
        );

        if (learningItem?.collocation_id) {
          const itemStep = (learningItem as any).step ?? (learningItem as any).user_step ?? 0;
          navigate(`/collocation/review/${learningItem.collocation_id}`, {
            replace: true,
            state: { step: itemStep },
          });
          return;
        }

        // 3. Lấy từ mới từ kho collocations (Từ mới nên step = 0)
        const defaultCollocation = await collocationApi.getNextCollocation();
        if (defaultCollocation?.id) {
          navigate(`/collocation/review/${defaultCollocation.id}`, {
            replace: true,
            state: { step: 0 },
          });
          return;
        }

        // Nếu tất cả đều không có -> bật trạng thái No Data / Hoàn thành bài học
        setNoData(true);
      } catch (error) {
        console.error("Redirect error:", error);
        toast.error("Có lỗi xảy ra khi tìm bài học");
        setNoData(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchAndRedirect();
  }, [navigate]);

  // Screen Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
          <p className="text-slate-300 font-semibold text-sm">
            Đang tìm bài tập Collocation phù hợp...
          </p>
        </div>
      </div>
    );
  }

  // Screen Empty State / All Clear (khi không có bài tập nào cần ôn)
  if (noData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Tuyệt vời!
          </span>

          <h2 className="text-xl font-black text-white mb-2 tracking-tight">
            Không còn bài tập nào lúc này!
          </h2>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Bạn đã hoàn thành tất cả các mục tiêu ôn tập hiện tại. Hãy quay lại sau khi tới lịch SRS tiếp theo nhé!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={() => navigate("/collocations")}
              className="w-full py-3 px-4 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 hover:text-white rounded-2xl transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Xem danh sách từ
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 rounded-2xl transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}