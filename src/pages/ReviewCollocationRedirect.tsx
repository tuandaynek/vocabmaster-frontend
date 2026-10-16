import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collocationApi } from "@/features/collocations/api/collocationApi";
import { toast } from "sonner";
import { CheckCircle2, Home, BookOpen, Sparkles } from "lucide-react";
import { getErrorMessage } from "@/features/collocations/utils/errorMessage";

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
          const itemStep = dueItem.step ?? dueItem.user_step ?? 0;
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
          const itemStep = learningItem.step ?? learningItem.user_step ?? 0;
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
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Có lỗi xảy ra khi tìm bài học"));
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
          <p className="text-sm font-semibold text-slate-600">
            Đang tìm bài tập Collocation phù hợp...
          </p>
        </div>
      </div>
    );
  }

  // Screen Empty State / All Clear (khi không có bài tập nào cần ôn)
  if (noData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-800">
        <div className="flex w-full max-w-md animate-in zoom-in-95 flex-col items-center rounded-3xl border-2 border-slate-100 bg-white p-8 text-center shadow-sm duration-300">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5" /> Tuyệt vời!
          </span>

          <h2 className="mb-2 text-xl font-extrabold tracking-tight text-slate-800">
            Không còn bài tập nào lúc này!
          </h2>

          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            Bạn đã hoàn thành tất cả các mục tiêu ôn tập hiện tại. Hãy quay lại sau khi tới lịch SRS tiếp theo nhé!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => navigate("/collocations")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
            >
              <BookOpen className="w-4 h-4" />
              Xem danh sách từ
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
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