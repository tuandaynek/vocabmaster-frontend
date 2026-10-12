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

        {/* Hero Section của Vocab Hub */}
        <div className="overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm sm:p-12">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Vocabulary & SRS Workspace
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
              Trạm học tập{" "}
              <span className="text-emerald-600">Từ vựng & Trí nhớ</span>
            </h1>
            <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
              Làm chủ vốn từ vựng học thuật IELTS thông qua công cụ trích xuất thông minh, từ điển cá nhân hóa và thuật toán ôn tập ngắt quãng (SRS).
            </p>
          </div>
        </div>

        {/* Grid Tính năng Từ vựng & SRS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          
          {/* 1. Vocab Extractor */}
          <div className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Vocab Extractor</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Trích xuất ngay lập tức các từ vựng và cụm từ ăn điểm từ bất kỳ đoạn văn bản hoặc bài báo tiếng Anh nào cùng định nghĩa và ví dụ chi tiết.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/vocab-extractor")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3.5 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              Trích xuất từ vựng <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 2. Dictionary & Kho từ cá nhân */}
          <div className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 transition-transform duration-200 group-hover:scale-105">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Dictionary & Kho Từ Của Tôi</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Tra cứu nghĩa từ vựng, nghe phát âm chuẩn bản xứ và quản lý toàn bộ danh sách từ đã lưu kèm ngữ cảnh cá nhân hóa của riêng bạn.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                type="button"
                onClick={() => navigate("/dictionary")}
                className="flex items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-3 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
              >
                Tra từ điển
              </button>
              <button
                type="button"
                onClick={() => navigate("/my-vocab")}
                className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              >
                Kho từ cá nhân
              </button>
            </div>
          </div>

          {/* 3. Flashcards SRS */}
          <div className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition-transform duration-200 group-hover:scale-105">
                <BrainCircuit className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Flashcards SRS (Spaced Repetition)</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Ôn tập từ vựng khoa học theo thuật toán lặp lại ngắt quãng. Tự đánh giá mức độ nhớ (Again / Hard / Good / Easy) để ghi nhớ sâu vào bộ nhớ dài hạn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/flashcards")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-3.5 font-bold text-amber-950 shadow-sm transition-all duration-150 hover:bg-amber-500 active:translate-y-1 active:border-b-0"
            >
              Bắt đầu ôn tập SRS <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 4. Collocation Routine */}
          <div className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-200 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 transition-transform duration-200 group-hover:scale-105">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Collocation Routine</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Luyện tập phản xạ cụm từ tự nhiên qua kịch bản Shadowing 4 bước, giúp nâng cấp điểm số Lexical Resource trong văn bản và bài nói.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/collocation/review")}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3.5 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              Luyện Collocations <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}