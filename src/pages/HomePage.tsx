import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { authApi } from "@/features/auth/api/authApi";
import { toast } from "sonner";
import {
  BookOpen,
  LogOut,
  User as UserIcon,
  GraduationCap,
  Mic2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Lỗi signout:", error);
    } finally {
      logout();
      toast.success("Đã đăng xuất thành công");
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* HEADER / NAVBAR CỰC KỲ GỌN GÀNG & HIỆN ĐẠI */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                IELTS Prep AI
              </span>
            </Link>

            {/* NAVIGATION TABS CHÍNH */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link
                to="/about"
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                Về chúng tôi (About)
              </Link>
              <Link
                to="/ielts"
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
              >
                IELTS Hub
              </Link>
              <Link
                to="/vocab"
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" /> Vocab & SRS
              </Link>
            </nav>
          </div>

          {/* USER PROFILE / AUTH */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-4 py-2 rounded-2xl text-sm font-medium text-slate-200 hover:text-white transition shadow-sm group"
                >
                  <UserIcon className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>{user?.username || user?.email?.split("@")[0]}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/signin" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition">
                  Đăng nhập
                </Link>
                <Link to="/signup" className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition">
                  Đăng ký ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO / WELCOME BANNER CHO TRANG CHỦ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            Nền tảng luyện thi thông minh thế hệ mới
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Chinh phục band điểm mơ ước cùng <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI Tutor</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Hệ thống tối ưu hóa toàn diện các kỹ năng IELTS và từ vựng chuyên sâu, giúp học sinh bứt phá điểm số một cách tự nhiên nhất.
          </p>
        </div>

        {/* 2 LỐI RẼ CHÍNH ĐỂ HỌC SINH KHÔNG BỊ NGỢP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card Luyện thi IELTS */}
          <div onClick={() => navigate("/ielts")} className="group relative bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform">
              <Mic2 className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">IELTS Workspace</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Trải nghiệm phòng luyện Speaking ảo với AI Examiner và công cụ chấm bài Writing chuyên sâu theo chuẩn 4 tiêu chí quốc tế.
            </p>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Khám phá ngay <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card Học từ vựng & SRS */}
          <div onClick={() => navigate("/vocab")} className="group relative bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Vocab & SRS Studio</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Hệ thống trích xuất từ vựng thông minh, ôn tập ngắt quãng (Flashcards SRS) và luyện tập collocation phản xạ cực nhạy.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
              Vào kho từ vựng <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}