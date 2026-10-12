import { useNavigate } from "react-router-dom";
import { Mic2, Sparkles, ArrowLeft, CheckCircle2, Award } from "lucide-react";

export default function IeltsHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl space-y-8 sm:space-y-10">
        {/* Nút quay lại */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
        </button>

        {/* Hero Section của Hub */}
        <div className="overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm sm:p-12">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-800">
              <Mic2 className="h-4 w-4" />
              IELTS Examination Suite
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
              Phòng luyện tập{" "}
              <span className="text-sky-600">Speaking & Writing</span>
            </h1>
            <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
              Tương tác trực tiếp với trợ lý AI Examiner, nhận báo cáo chi tiết theo chuẩn giám khảo quốc tế giúp bạn tự tin đạt band 7.0+.
            </p>
          </div>
        </div>

        {/* Grid Tính năng IELTS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Speaking Card */}
          <div className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 transition-transform duration-200 group-hover:scale-105">
                <Mic2 className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">IELTS Speaking Practice</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Luyện tập đầy đủ Part 1, 2, 3 với hệ thống ghi âm giọng nói, chấm điểm chi tiết về Phát âm, Độ lưu loát, Từ vựng và Ngữ pháp.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Phát âm mẫu giọng bản xứ</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Gợi ý từ vựng nâng cấp (Lexical Upgrade)</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => navigate("/ielts/speaking")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3.5 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              Vào phòng Speaking <Sparkles className="h-4 w-4" />
            </button>
          </div>

          {/* Writing Card */}
          <div className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition-transform duration-200 group-hover:scale-105">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Luyện Writing Task 1 & 2</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Nộp bài luận trực tiếp để AI phân tích cấu trúc bài viết, chỉ ra lỗi sai ngữ pháp và đưa ra các câu paraphrase mượt mà hơn.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Đánh giá Task Achievement chuẩn xác</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sửa lỗi trực quan từng câu chữ</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => navigate("/ielts/writing")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-3.5 font-bold text-amber-950 shadow-sm transition-all duration-150 hover:bg-amber-500 active:translate-y-1 active:border-b-0"
            >
              Vào phòng Writing <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}