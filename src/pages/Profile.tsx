import { useState, useEffect, useCallback } from "react";
import {
  Flame,
  BookOpen,
  Layers,
  Zap,
  Award,
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

function getProfileErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Không thể tải dữ liệu hồ sơ.";
}

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

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await profileApi.getProfile();
      setUser(res.data);
    } catch (err: unknown) {
      setError(getProfileErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => {
      void fetchProfileData();
    }, 0);
    return () => window.clearTimeout(fetchTimer);
  }, [fetchProfileData]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-rose-700">
        <AlertCircle className="w-10 h-10" />
        <p className="text-center font-medium">
          {error || "Dữ liệu không tồn tại."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-full space-y-6 bg-slate-50 p-4 text-slate-800 md:space-y-8 md:p-8">
      
      {/* HEADER TOP: Nút Back về Trang Chủ */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
        >
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Hồ sơ người dùng
        </span>
      </div>

      {/* HEADER: User Info & Level Progress */}
      <section className="flex flex-col items-center gap-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm md:flex-row md:p-8">
        <img
          src={
            user.avatarUrl ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`
          }
          alt={user.username}
          className="h-20 w-20 rounded-full border-4 border-emerald-200 bg-emerald-50 p-1 object-cover shadow-sm"
        />

        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
                {user.username}
              </h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="inline-flex items-center gap-2 self-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-800 md:self-auto">
              <Award className="w-4 h-4 shrink-0" />
              <span>Level {level} Learner</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Tiến trình Level {level}</span>
              <span>
                {currentLevelXp} / {nextLevelXp} XP ({progressPercent}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS GRID: 4 Ô Chỉ số chính */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Streak */}
        <div className="space-y-3 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Streak hiện tại
            </span>
            <Flame className="h-5 w-5 fill-orange-100" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-800">
              {user.currentStreak}
            </span>
            <span className="text-xs font-semibold text-slate-500">ngày</span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Kỷ lục:{" "}
            <strong className="text-slate-700">{user.longestStreak}</strong>{" "}
            ngày
          </p>
        </div>

        {/* Card 2: Total XP */}
        <div className="space-y-3 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng XP
            </span>
            <Zap className="h-5 w-5 fill-amber-100" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-800">
              {user.totalXp.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">XP</span>
          </div>
          <p className="text-xs font-medium text-slate-500">Mức độ chăm chỉ tích lũy</p>
        </div>

        {/* Card 3: Vocab Count */}
        <div className="space-y-3 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Từ vựng
            </span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-800">
              {user.cachedVocabCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">từ</span>
          </div>
          <p className="text-xs font-medium text-slate-500">Đã lưu trong sổ tay</p>
        </div>

        {/* Card 4: Collocation Count */}
        <div className="space-y-3 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between text-violet-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Collocations
            </span>
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-800">
              {user.cachedCollocationCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">cụm</span>
          </div>
          <p className="text-xs font-medium text-slate-500">Cụm từ đã làm chủ</p>
        </div>
      </section>

      {/* CHIA 2 CỘT: CỘT TRÁI (LỊCH 2/3) & CỘT PHẢI (MỤC TIÊU 1/3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CỘT TRÁI: Activity Calendar (Chiếm 2/3 width) */}
        <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <ActivityCalendar activityHistory={user.activityHistory || []} />
        </div>

        {/* CỘT PHẢI: Mục tiêu & Lời khuyên (Chiếm 1/3 width) */}
        <div className="space-y-6">
          {/* Card Mục tiêu tuần */}
          <div className="space-y-5 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Target className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-800">
                Mục tiêu tuần này
              </h3>
            </div>

            <div className="space-y-4">
              {/* Duy trì Streak */}
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Duy trì Streak
                </span>
                <span className="font-bold text-amber-700">
                  {user.currentStreak} / 7 ngày
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-amber-200 bg-amber-50">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300 shadow-sm"
                  style={{
                    width: `${Math.min(100, (user.currentStreak / 7) * 100)}%`,
                  }}
                />
              </div>

              {/* XP kiếm được */}
              <div className="flex justify-between text-xs mt-3">
                <span className="font-semibold text-slate-700">XP đạt được</span>
                <span className="font-bold text-emerald-700">
                  {user.totalXp} / 300 XP
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-emerald-200 bg-emerald-50">
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
          <div className="relative space-y-3 overflow-hidden rounded-3xl border-2 border-sky-200 bg-sky-50 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 text-sky-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-800">Gợi ý hôm nay</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-600">
              Bạn đang làm rất tốt! Hãy học thêm{" "}
              <strong className="text-slate-800">10 từ vựng IELTS</strong> thuộc
              chủ đề <span className="font-bold text-sky-700">Environment</span> để duy
              trì Streak và giữ chuỗi thói quen nhé.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
