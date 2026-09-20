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
          navigate(`/collocation/review/${dueItem.collocation_id}`, {
            replace: true,
          });
          return;
        }

        // 2. Nếu chưa có từ nào tới hạn review, lấy từ đang trong tiến trình (chưa mastered)
        const learningItem = userList.find(
          (item) => item.collocation_id && item.status !== "mastered"
        );

        if (learningItem?.collocation_id) {
          navigate(`/collocation/review/${learningItem.collocation_id}`, {
            replace: true,
          });
          return;
        }

        // 3. Lấy từ mới từ kho collocations
        const defaultCollocation = await collocationApi.getNextCollocation();
        if (defaultCollocation?.id) {
          navigate(`/collocation/review/${defaultCollocation.id}`, {
            replace: true,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="text-slate-600 font-medium text-sm">
            Đang tìm bài tập Collocation phù hợp...
          </p>
        </div>
      </div>
    );
  }

  // Screen Empty State / All Clear (khi không có bài tập nào cần ôn)
  if (noData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Tuyệt vời!
          </span>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Không còn bài tập nào lúc này!
          </h2>

          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Bạn đã hoàn thành tất cả các mục tiêu ôn tập hiện tại. Hãy quay lại sau khi tới lịch SRS tiếp theo nhé!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={() => navigate("/collocations")}
              className="w-full py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Xem danh sách từ
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
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