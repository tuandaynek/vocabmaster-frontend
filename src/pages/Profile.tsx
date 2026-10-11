import { useState, useEffect } from "react";
import {
  Flame,
  BookOpen,
  Layers,
  Zap,
  Award,
  Calendar,
  Target,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import ActivityCalendar from "@/features/profile/components/ActivityCalendar";
import { profileApi } from "@/features/profile/api/profileApi";
import type { UserProfile } from "@/features/profile/types";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { level, currentLevelXp, nextLevelXp, progressPercent } = user?.levelInfo || {
    level: 0,
    currentLevelXp: 0,
    nextLevelXp: 100,
    progressPercent: 0,
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await profileApi.getProfile();
      console.log(res.data);
      setUser(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải dữ liệu hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-rose-400 p-4">
        <AlertCircle className="w-10 h-10" />
        <p className="text-center font-medium">
          {error || "Dữ liệu không tồn tại."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-full mx-auto space-y-6 md:space-y-8">
      
      {/* HEADER TOP: Nút Back về Trang Chủ */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Hồ sơ người dùng
        </span>
      </div>

      {/* HEADER: User Info & Level Progress */}
      <section className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl backdrop-blur-xl">
        <img
          src={
            user.avatarUrl ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`
          }
          alt={user.username}
          className="w-20 h-20 rounded-full border-2 border-indigo-500/30 bg-slate-950 p-1 object-cover shadow-inner"
        />

        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {user.username}
              </h1>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs self-center md:self-auto shadow-inner">
              <Award className="w-4 h-4 shrink-0" />
              <span>Level {level} Learner</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Tiến trình Level {level}</span>
              <span>
                {currentLevelXp} / {nextLevelXp} XP ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS GRID: 4 Ô Chỉ số chính */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Streak */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] space-y-3 hover:border-slate-700 transition shadow-xl">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Streak hiện tại
            </span>
            <Flame className="w-5 h-5 fill-amber-500/20 drop-shadow-md" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {user.currentStreak}
            </span>
            <span className="text-xs text-slate-400 font-semibold">ngày</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Kỷ lục:{" "}
            <strong className="text-slate-300">{user.longestStreak}</strong>{" "}
            ngày
          </p>
        </div>

        {/* Card 2: Total XP */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] space-y-3 hover:border-slate-700 transition shadow-xl">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng XP
            </span>
            <Zap className="w-5 h-5 fill-cyan-400/20" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {user.totalXp.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">XP</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Mức độ chăm chỉ tích lũy</p>
        </div>

        {/* Card 3: Vocab Count */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] space-y-3 hover:border-slate-700 transition shadow-xl">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Từ vựng
            </span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {user.cachedVocabCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">từ</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Đã lưu trong sổ tay</p>
        </div>

        {/* Card 4: Collocation Count */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] space-y-3 hover:border-slate-700 transition shadow-xl">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Collocations
            </span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">
              {user.cachedCollocationCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">cụm</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Cụm từ đã làm chủ</p>
        </div>
      </section>

      {/* CHIA 2 CỘT: CỘT TRÁI (LỊCH 2/3) & CỘT PHẢI (MỤC TIÊU 1/3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CỘT TRÁI: Activity Calendar (Chiếm 2/3 width) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-xl">
          <ActivityCalendar activityHistory={user.activityHistory || []} />
        </div>

        {/* CỘT PHẢI: Mục tiêu & Lời khuyên (Chiếm 1/3 width) */}
        <div className="space-y-6">
          {/* Card Mục tiêu tuần */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Target className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">
                Mục tiêu tuần này
              </h3>
            </div>

            <div className="space-y-4">
              {/* Duy trì Streak */}
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  Duy trì Streak
                </span>
                <span className="text-amber-400 font-bold">
                  {user.currentStreak} / 7 ngày
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{
                    width: `${Math.min(100, (user.currentStreak / 7) * 100)}%`,
                  }}
                />
              </div>

              {/* XP kiếm được */}
              <div className="flex justify-between text-xs mt-3">
                <span className="text-slate-300 font-semibold">XP đạt được</span>
                <span className="text-emerald-400 font-bold">
                  {user.totalXp} / 300 XP
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{
                    width: `${Math.min(100, (user.totalXp / 300) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card Lời khuyên AI */}
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-3 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Gợi ý hôm nay</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Bạn đang làm rất tốt! Hãy học thêm{" "}
              <strong className="text-slate-200">10 từ vựng IELTS</strong> thuộc
              chủ đề <span className="text-cyan-400 font-bold">Environment</span> để duy
              trì Streak và giữ chuỗi thói quen nhé.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
