import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { authApi } from "@/features/auth/api/authApi";
import { toast } from "sonner";
import {
  BookOpen,
  Sparkles,
  LogOut,
  User as UserIcon,
  GraduationCap,
  Mic2,
  ArrowRight,
  Volume2,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await authApi.logout(); // Gọi API xoá Cookie/Session ở Backend nếu có
    } catch (error) {
      console.error("Lỗi signout:", error);
    } finally {
      logout(); // Xoá state trong Zustand & localStorage
      toast.success("Đã đăng xuất thành công");
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* HEADER / NAVBAR */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              IELTS Prep Workspace
            </span>
          </div>

          {/* USER PROFILE OR AUTH BUTTONS */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <UserIcon className="h-4 w-4 text-indigo-600" />
                  <span>{user?.username || user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Hệ thống Học tập & Luyện thi{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              IELTS AI
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {isAuthenticated
              ? `Chào mừng ${user?.username || "bạn"} trở lại! Chọn một tính năng bên dưới để bắt đầu buổi học.`
              : "Nền tảng hỗ trợ luyện thi IELTS toàn diện kết hợp AI. Đăng nhập để sử dụng đầy đủ các tính năng."}
          </p>
        </div>

        {/* FUNCTION GRID (CÁC TÍNH NĂNG CỦA PROJECT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vocabulary Master (Tính năng mở rộng sau này) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between opacity-80">
            <div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Kho Từ Vựng (Vocab)</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Học từ vựng theo chủ đề IELTS với hệ thống Flashcard thông minh
                và thuật toán lặp lại ngắt quãng (Spaced Repetition).
              </p>
            </div>
            <button
              onClick={() => navigate("/vocab-extractor")}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              Vào Vocab Extractor
              <BookOpen className="h-4 w-4" />
            </button>
          </div>

          {/* Dictionary page */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between opacity-90">
            <div>
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Dictionary & Kho từ của tôi
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Xem danh sách từ vựng bạn đã lưu, nghe phát âm, theo dõi trạng
                thái học và câu ngữ cảnh cá nhân.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/dictionary")}
                className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                Mở Dictionary
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => navigate("/my-vocab")}
              className="mt-2 w-full py-2.5 px-4 border border-violet-200 text-violet-700 hover:bg-violet-50 font-medium rounded-xl transition"
            >
              Xem kho từ cá nhân
            </button>
          </div>

          {/* Feature 3: Flashcards SRS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between opacity-90">
            <div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Flashcards SRS</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Ôn tập các từ đã lưu theo lộ trình lặp lại ngắt quãng, chấm điểm
                Again / Hard / Good / Easy và theo dõi tiến độ học mỗi ngày.
              </p>
            </div>
            <button
              onClick={() => navigate("/flashcards")}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              Mở Flashcards
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          {/* Feature 4: IELTS Speaking Practice */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                <Mic2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                IELTS Speaking Practice
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Luyện Speaking theo Part 1, 2, 3 với AI Examiner, gợi ý ý tưởng
                và đánh giá câu trả lời.
              </p>
            </div>
            <button
              onClick={() => navigate("/ielts/speaking")}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              Mở Speaking Hub
              <Mic2 className="h-4 w-4" />
            </button>
          </div>

          {/* Feature 5: Writing Evaluation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Luyện Writing Task 1 & 2
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Nộp bài luận để nhận phân tích chi tiết về Coherence, Lexical
                Resource, và Grammatical Range.
              </p>
            </div>
            <button
              onClick={() => navigate("/ielts/writing")}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              Mở Writing Tutor
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collocation Routine</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Luyện tập phản xạ cụm từ qua kịch bản Shadowing 4 bước, làm chủ
                cách dùng tự nhiên và cải thiện độ chính xác phát âm.
              </p>
            </div>
            <button
              onClick={() => navigate("/collocation/review")}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              Luyện Collocations
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
