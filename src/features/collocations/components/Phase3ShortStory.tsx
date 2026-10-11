import { useState } from "react";
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  Trophy,
  ArrowRight,
  Globe,
  RotateCcw,
  Bot,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  CheckCheck,
} from "lucide-react";
import { collocationApi } from "../api/collocationApi";
import type { CollocationReviewData, EvaluatePhase3Response } from "../types";

interface Props {
  collocation: CollocationReviewData;
  onComplete: () => void;
}

export default function Phase3ShortStory({ collocation, onComplete }: Props) {
  const targetId = collocation.collocationId || collocation.id;
  const phrase = collocation.phrase;

  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluatePhase3Response | null>(null);

  const sentenceCount = story
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;

  const handleSubmit = async () => {
    if (!story.trim() || loading) return;

    try {
      setLoading(true);
      const res = await collocationApi.evaluatePhase3({
        collocationId: targetId,
        userStory: story.trim(),
        mode: "custom_story",
      });
      const data = res.data as EvaluatePhase3Response;
      setResult(data);
    } catch (err: any) {
      console.error("Phase 3 Evaluation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
              Phase 3: Sáng tác mẩu chuyện ngắn
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              Thực hành cụm từ: <span className="text-purple-400 underline">&ldquo;{phrase}&rdquo;</span>
            </h3>
          </div>
        </div>

        {/* Điểm số hiển thị góc phải trên cùng khi đã chấm */}
        {result && typeof result.score === "number" && (
          <div className="flex items-center gap-3 bg-purple-500/10 px-4 py-2 rounded-2xl border border-purple-500/20">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Điểm số</span>
            <div className="text-2xl font-black text-purple-400">
              {result.score}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
          </div>
        )}
      </div>

      {/* CHẾ ĐỘ 1: CHƯA NỘP BÀI */}
      {!result ? (
        <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-7 shadow-2xl space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-300">
            <span>📌 Yêu cầu tối thiểu: <strong className="text-white">3 câu tiếng Anh</strong></span>
            <span className={sentenceCount >= 3 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              Đã viết: {sentenceCount}/3 câu
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Nội dung mẩu chuyện của bạn:
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              disabled={loading}
              placeholder={`Ví dụ: Yesterday, I had a tough decision to make. I decided to ${phrase} in order to achieve long-term growth...`}
              className="w-full p-4 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none font-medium text-sm leading-relaxed resize-none h-44 transition placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !story.trim() || sentenceCount < 1}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-2xl border border-purple-500 shadow-xl shadow-purple-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>AI đang thẩm định bài viết...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi AI Chấm điểm</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* CHẾ ĐỘ 2: ĐÃ CÓ KẾT QUẢ -> 2 CỘT SONG SONG */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* BANNER TỔNG QUAN AI FEEDBACK */}
          <div className={`p-5 rounded-3xl border flex items-start gap-3.5 ${
            result.state === "Not completed"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : result.state === "Good"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}>
            <Bot className="w-6 h-6 shrink-0 mt-0.5 text-current" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Đánh giá: {result.state}
              </h4>
              <p className="text-xs font-medium leading-relaxed text-slate-200">{result.feedback}</p>
            </div>
          </div>

          {/* KHU VỰC ĐỐI CHIẾU SONG SONG */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CỘT TRÁI: BÀI LÀM GỐC + CHI TIẾT LỖI */}
            <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 shadow-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Bài làm gốc của bạn</span>
                </div>
                
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm font-medium leading-relaxed text-slate-200 whitespace-pre-line min-h-[120px]">
                  &ldquo;{story}&rdquo;
                </div>

                {result.highlightedErrors && result.highlightedErrors.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Các điểm cần điều chỉnh ({result.highlightedErrors.length}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.highlightedErrors.map((errItem, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                          <span className="line-through text-rose-300 font-medium">{errItem.error}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mx-2" />
                          <span className="text-emerald-300 font-bold">{errItem.correction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: BÀI SỬA CHUẨN + CỘNG ĐỒNG */}
            <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 shadow-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCheck className="w-4 h-4 text-indigo-400" />
                  <span>Bản gợi ý biên tập chuẩn hơn</span>
                </div>

                {result.correctedStory ? (
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-sm font-medium leading-relaxed text-indigo-200 italic whitespace-pre-line min-h-[120px]">
                    &ldquo;{result.correctedStory}&rdquo;
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300">
                    🎉 Bài viết của bạn đã rất tự nhiên và không cần sửa thêm!
                  </div>
                )}

                {result.communityStories && result.communityStories.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Tham khảo từ cộng đồng:
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.communityStories.slice(0, 5).map((item, idx) => (
                        <p key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic">
                          &ldquo;{item}&rdquo;
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2">
            {result.state === "Not completed" ? (
              <button
                onClick={handleReset}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 transition flex items-center justify-center gap-2 shadow-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Sửa lại bài viết
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-2xl border border-emerald-500 shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Hoàn tất bài học</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}