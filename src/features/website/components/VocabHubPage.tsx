import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ArrowLeft, 
  Layers,  
  Search, 
  ArrowRight,
  BrainCircuit
} from "lucide-react";

export default function VocabHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Hiệu ứng ánh sáng nền đặc trưng */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>

        {/* Hero Section của Vocab Hub */}
        <div className="relative bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-indigo-950/40 border border-slate-800/80 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Vocabulary & SRS Workspace
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Trạm không gian <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Từ vựng & Trí nhớ</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg">
              Làm chủ vốn từ vựng học thuật IELTS thông qua công cụ trích xuất thông minh, từ điển cá nhân hóa và thuật toán ôn tập ngắt quãng (SRS).
            </p>
          </div>
        </div>

        {/* Grid Tính năng Từ vựng & SRS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Vocab Extractor */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Vocab Extractor</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Trích xuất ngay lập tức các từ vựng và cụm từ ăn điểm từ bất kỳ đoạn văn bản hoặc bài báo tiếng Anh nào cùng định nghĩa và ví dụ chi tiết.
              </p>
            </div>
            <button
              onClick={() => navigate("/vocab-extractor")}
              className="mt-8 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              Trích xuất từ vựng <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Dictionary & Kho từ cá nhân */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center border border-violet-500/20 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Dictionary & Kho Từ Của Tôi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tra cứu nghĩa từ vựng, nghe phát âm chuẩn bản xứ và quản lý toàn bộ danh sách từ đã lưu kèm ngữ cảnh cá nhân hóa của riêng bạn.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => navigate("/dictionary")}
                className="py-3 px-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-violet-600/30 transition text-sm flex items-center justify-center gap-1.5"
              >
                Tra từ điển
              </button>
              <button
                onClick={() => navigate("/my-vocab")}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl border border-slate-700 transition text-sm flex items-center justify-center gap-1.5"
              >
                Kho từ cá nhân
              </button>
            </div>
          </div>

          {/* 3. Flashcards SRS */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Flashcards SRS (Spaced Repetition)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ôn tập từ vựng khoa học theo thuật toán lặp lại ngắt quãng. Tự đánh giá mức độ nhớ (Again / Hard / Good / Easy) để ghi nhớ sâu vào bộ nhớ dài hạn.
              </p>
            </div>
            <button
              onClick={() => navigate("/flashcards")}
              className="mt-8 w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-2xl shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
            >
              Bắt đầu ôn tập SRS <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4. Collocation Routine */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Collocation Routine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Luyện tập phản xạ cụm từ tự nhiên qua kịch bản Shadowing 4 bước, giúp nâng cấp điểm số Lexical Resource trong văn bản và bài nói.
              </p>
            </div>
            <button
              onClick={() => navigate("/collocation/review")}
              className="mt-8 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              Luyện Collocations <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}