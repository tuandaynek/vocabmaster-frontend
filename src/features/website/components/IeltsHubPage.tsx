import { useNavigate } from "react-router-dom";
import { Mic2, Sparkles, ArrowLeft, CheckCircle2, Award } from "lucide-react";

export default function IeltsHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Hiệu ứng ánh sáng nền */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>

        {/* Hero Section của Hub */}
        <div className="relative bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-slate-800/80 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              IELTS Examination Suite
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Phòng luyện tập <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Speaking & Writing</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg">
              Tương tác trực tiếp với trợ lý AI Examiner, nhận báo cáo chi tiết theo chuẩn giám khảo quốc tế giúp bạn tự tin đạt band 7.0+.
            </p>
          </div>
        </div>

        {/* Grid Tính năng IELTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Speaking Card */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Mic2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">IELTS Speaking Practice</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Luyện tập đầy đủ Part 1, 2, 3 với hệ thống ghi âm giọng nói, chấm điểm chi tiết về Phát âm, Độ lưu loát, Từ vựng và Ngữ pháp.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Phát âm mẫu giọng bản xứ</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Gợi ý từ vựng nâng cấp (Lexical Upgrade)</li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/ielts/speaking")}
              className="mt-8 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              Vào phòng Speaking <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Writing Card */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Luyện Writing Task 1 & 2</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nộp bài luận trực tiếp để AI phân tích cấu trúc bài viết, chỉ ra lỗi sai ngữ pháp và đưa ra các câu paraphrase mượt mà hơn.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Đánh giá Task Achievement chuẩn xác</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Sửa lỗi trực quan từng câu chữ</li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/ielts/writing")}
              className="mt-8 w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
            >
              Vào phòng Writing <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}