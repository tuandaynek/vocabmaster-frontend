import { useEffect, useState } from "react";
import {
  Star,
  MessageSquare,
  CheckCircle,
  Quote,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { websiteApi } from "@/features/website/api/websiteApi";
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
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    avgRating: 0,
    totalRatings: 0,
  });
  const [loading, setLoading] = useState(true);

  // Hàm gọi API lấy dữ liệu từ backend
  useEffect(() => {
    const fetchWallOfLoveData = async () => {
      try {
        setLoading(true);

        const response = await websiteApi.getStatsPublic();

        console.log(response);

        setStats(response.stats);
        setFeedbacks(response.recentFeed);
      } catch (error) {
        console.error("Không thể tải dữ liệu Wall of Love:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallOfLoveData();
  }, []);

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
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10";
    }
    if (lower.includes("writing")) {
      return "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/10";
    }
    if (lower.includes("speaking")) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10";
    }
    if (lower.includes("collocation")) {
      return "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sky-500/10";
    }
    if (lower.includes("vocab") || lower.includes("extractor")) {
      return "bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-teal-500/10";
    }
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* 🌟 Hiệu ứng ánh sáng nền (Ambient Glow Blobs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[450px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Cộng đồng nói gì về{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              chúng tôi?
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg">
            Những đánh giá chân thực từ người dùng là động lực cốt lõi giúp hệ
            thống không ngừng vươn xa mỗi ngày.
          </p>
        </div>

        {/* Stats Overview Bar (Glassmorphism + Hover Glow) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 transition hover:bg-slate-800/50">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {stats.avgRating}{" "}
                <span className="text-sm font-normal text-slate-400">
                  / 5.0
                </span>
              </div>
              <div className="text-xs font-medium text-slate-400">
                Điểm đánh giá trung bình
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 transition hover:bg-slate-800/50">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {stats.totalRatings}
              </div>
              <div className="text-xs font-medium text-slate-400">
                Tổng lượt feedback thực tế
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 transition hover:bg-slate-800/50">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {stats.totalUsers}+
              </div>
              <div className="text-xs font-medium text-slate-400">
                Người dùng đồng hành
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {CATEGORIES.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                selectedTab === tab
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                  : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
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
              className="relative group bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-3xl p-7 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
            >
              {/* Dấu ngoặc kép mờ làm hình nền trang trí sang trọng */}
              <Quote className="absolute -bottom-4 -right-2 w-28 h-28 text-slate-800/30 pointer-events-none group-hover:text-indigo-500/10 transition-colors duration-500" />

              <div className="space-y-5 relative z-10">
                {/* Top Info: User & Feature Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-purple-500/20">
                      {item.users.avatar_url ? (
                        <img
                          src={item.users.avatar_url}
                          alt=""
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        getInitials(item.users.username)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {item.users.username}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
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
                    className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${getFeatureBadgeStyle(item.feature_name)}`}
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
                          : "text-slate-800"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment Content */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal italic">
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
