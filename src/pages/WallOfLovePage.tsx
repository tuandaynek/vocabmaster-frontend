import { useCallback, useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle,
  Quote,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { websiteApi } from "@/features/website/api/websiteApi";
import type {
  PublicWebsiteStats,
  WebsiteFeedback,
  WebsiteStats,
} from "@/features/website/types";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Tất cả",
  "Flashcards",
  "IELTS Writing Evaluator",
  "IELTS Speaking Evaluator",
  "Collocation Review",
  "Vocab Extractor",
];

export default function WallOfLovePage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [feedbacks, setFeedbacks] = useState<WebsiteFeedback[]>([]);
  const [stats, setStats] = useState<WebsiteStats>({
    totalUsers: 0,
    avgRating: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWallOfLoveData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response: PublicWebsiteStats = await websiteApi.getStatsPublic();
      setStats(response.stats);
      setFeedbacks(response.recentFeed);
    } catch {
      setError("Không thể tải đánh giá. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTimer = window.setTimeout(() => {
      void fetchWallOfLoveData();
    }, 0);
    return () => window.clearTimeout(fetchTimer);
  }, [fetchWallOfLoveData]);

  const filteredFeedbacks =
    selectedTab === "Tất cả"
      ? feedbacks
      : feedbacks.filter(
          (f) => f.feature_name.toLowerCase() === selectedTab.toLowerCase(),
        );

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Hàm tạo màu sắc riêng biệt cho từng tính năng để tăng tính sinh động
  const getFeatureBadgeStyle = (featureName: string) => {
    const lower = featureName.toLowerCase();
    if (lower.includes("flashcard")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
    if (lower.includes("writing")) {
      return "bg-violet-50 text-violet-800 border-violet-200";
    }
    if (lower.includes("speaking")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    if (lower.includes("collocation")) {
      return "bg-sky-50 text-sky-800 border-sky-200";
    }
    if (lower.includes("vocab") || lower.includes("extractor")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-slate-600">
        <p role="alert" className="text-center text-sm font-medium">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void fetchWallOfLoveData()}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-16 text-slate-800 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-amber-100/50 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-[350px] w-[500px] rounded-full bg-emerald-100/50 blur-[130px]" />

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Nút quay lại */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Cộng đồng nói gì về{" "}
            <span className="text-emerald-600">
              chúng tôi?
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg">
            Những đánh giá chân thực từ người dùng là động lực cốt lõi giúp hệ
            thống không ngừng vươn xa mỗi ngày.
          </p>
        </div>

        {/* Stats Overview Bar (Glassmorphism + Hover Glow) */}
        <div className="grid grid-cols-1 gap-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100">
            <div className="rounded-2xl border border-amber-200 bg-white p-3 text-amber-700">
              <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">
                {stats.avgRating}{" "}
                <span className="text-sm font-medium text-slate-500">
                  / 5.0
                </span>
              </div>
              <div className="text-xs font-medium text-slate-600">
                Điểm đánh giá trung bình
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 transition hover:bg-sky-100">
            <div className="rounded-2xl border border-sky-200 bg-white p-3 text-sky-700">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">
                {stats.totalRatings}
              </div>
              <div className="text-xs font-medium text-slate-600">
                Tổng lượt feedback thực tế
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100">
            <div className="rounded-2xl border border-emerald-200 bg-white p-3 text-emerald-700">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">
                {stats.totalUsers}+
              </div>
              <div className="text-xs font-medium text-slate-600">
                Người dùng đồng hành
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {CATEGORIES.map((tab) => (
            <button
            type="button"
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`rounded-2xl px-6 py-2.5 text-sm font-bold transition-all duration-150 ${
              selectedTab === tab
                ? "border-b-4 border-emerald-700 bg-emerald-500 text-white shadow-sm active:translate-y-1 active:border-b-0"
                : "border-2 border-b-4 border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feedback Cards Grid (Dynamic Cards with Watermark Quote) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeedbacks.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-md"
            >
              {/* Dấu ngoặc kép mờ làm hình nền trang trí sang trọng */}
              <Quote className="pointer-events-none absolute -bottom-4 -right-2 h-28 w-28 text-amber-100 transition-colors duration-500 group-hover:text-amber-200" />

              <div className="space-y-5 relative z-10">
                {/* Top Info: User & Feature Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-sm font-bold text-emerald-800">
                      {item.users?.avatar_url ? (
                        <img
                          src={item.users.avatar_url}
                          alt={`${item.users.username} avatar`}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        getInitials(item.users?.username ?? "Ẩn danh")
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 transition-colors group-hover:text-emerald-700">
                        {item.users?.username ?? "Ẩn danh"}
                      </h4>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(item.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Badge màu sắc riêng biệt từng tính năng */}
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getFeatureBadgeStyle(item.feature_name)}`}
                  >
                    {item.feature_name}
                  </span>
                </div>

                {/* Stars with subtle glowing effect */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                        i < item.rating
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment Content */}
                <p className="text-sm font-normal italic leading-relaxed text-slate-600 sm:text-base">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
