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
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <header className="sticky top-0 z-50 border-b-2 border-slate-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex cursor-pointer items-center gap-3">
              <div className="rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 p-2.5 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-800">
                IELTS Prep AI
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <Link
                to="/about"
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                Về chúng tôi (About)
              </Link>
              <Link
                to="/ielts"
                className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                IELTS Hub
              </Link>
              <Link
                to="/vocab"
                className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <BookOpen className="h-4 w-4 text-emerald-600" /> Vocab & SRS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/profile"
                  className="group flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 sm:px-4"
                >
                  <UserIcon className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-110" />
                  <span className="max-w-32 truncate sm:max-w-none">{user?.username || user?.email?.split("@")[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-150 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:translate-y-1 active:border-b-2"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/signin" className="rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 sm:px-4">
                  Đăng nhập
                </Link>
                <Link to="/signup" className="rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 sm:px-5">
                  Đăng ký ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl space-y-6 text-center sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-amber-800 sm:text-sm">
            <GraduationCap className="h-4 w-4 text-amber-600" />
            Nền tảng luyện thi thông minh thế hệ mới
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-6xl">
            Chinh phục band điểm mơ ước cùng{" "}
            <span className="text-emerald-600">AI Tutor</span>
          </h1>
          <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
            Hệ thống tối ưu hóa toàn diện các kỹ năng IELTS và từ vựng chuyên sâu, giúp học sinh bứt phá điểm số một cách tự nhiên nhất.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <div
            onClick={() => navigate("/ielts")}
            className="group relative cursor-pointer rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md sm:p-8"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 transition-transform duration-200 group-hover:scale-105">
              <Mic2 className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-2xl font-extrabold text-slate-800">IELTS Workspace</h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Trải nghiệm phòng luyện Speaking ảo với AI Examiner và công cụ chấm bài Writing chuyên sâu theo chuẩn 4 tiêu chí quốc tế.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-sky-700 transition-transform group-hover:translate-x-1">
              Khám phá ngay <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <div
            onClick={() => navigate("/vocab")}
            className="group relative cursor-pointer rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md sm:p-8"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-transform duration-200 group-hover:scale-105">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-2xl font-extrabold text-slate-800">Vocab & SRS Studio</h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Hệ thống trích xuất từ vựng thông minh, ôn tập ngắt quãng (Flashcards SRS) và luyện tập collocation phản xạ cực nhạy.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 transition-transform group-hover:translate-x-1">
              Vào kho từ vựng <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}