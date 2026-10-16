import { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  Globe,
  RotateCcw,
  Bot,
  Send,
  AlertTriangle,
  FileText,
  CheckCheck,
} from "lucide-react";
import { collocationApi } from "../api/collocationApi";
import type { CollocationReviewData, EvaluatePhase3Response } from "../types";
import { getErrorMessage } from "../utils/errorMessage";

interface Props {
  collocation: CollocationReviewData;
  onComplete: () => void;
}

export default function Phase3ShortStory({ collocation, onComplete }: Props) {
  const targetId = collocation.collocationId;
  const phrase = collocation.phrase;

  const [story, setStory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluatePhase3Response | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sentenceCount = story
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;

  const handleSubmit = async () => {
    if (!story.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);
      const res = await collocationApi.evaluatePhase3({
        collocationId: targetId,
        userStory: story.trim(),
        mode: "custom_story",
      });
      setResult(res.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể chấm điểm bài viết."));
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
      <div className="flex items-center justify-between gap-3 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 font-bold text-violet-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-800">
              Phase 3: Sáng tác mẩu chuyện ngắn
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-800">
              Thực hành cụm từ: <span className="text-emerald-700 underline">&ldquo;{phrase}&rdquo;</span>
            </h3>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        {/* Điểm số hiển thị góc phải trên cùng khi đã chấm */}
        {result && typeof result.score === "number" && (
          <div className="flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Điểm số</span>
            <div className="text-2xl font-extrabold text-amber-700">
              {result.score}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
          </div>
        )}
      </div>

      {/* CHẾ ĐỘ 1: CHƯA NỘP BÀI */}
      {!result ? (
        <div className="space-y-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-slate-700">
            <span>📌 Yêu cầu tối thiểu: <strong className="text-slate-800">3 câu tiếng Anh</strong></span>
            <span className={sentenceCount >= 3 ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>
              Đã viết: {sentenceCount}/3 câu
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="px-1 text-xs font-bold uppercase tracking-wider text-slate-600">
              Nội dung mẩu chuyện của bạn:
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              disabled={loading}
              placeholder={`Ví dụ: Yesterday, I had a tough decision to make. I decided to ${phrase} in order to achieve long-term growth...`}
              className="h-44 w-full resize-none rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm font-medium leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !story.trim() || sentenceCount < 1}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-4 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className={`flex items-start gap-3.5 rounded-3xl border-2 p-5 ${
            result.state === "Not completed"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : result.state === "Good"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}>
            <Bot className="w-6 h-6 shrink-0 mt-0.5 text-current" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Đánh giá: {result.state}
              </h4>
              <p className="text-xs font-medium leading-relaxed text-slate-700">{result.feedback}</p>
            </div>
          </div>

          {/* KHU VỰC ĐỐI CHIẾU SONG SONG */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* CỘT TRÁI: BÀI LÀM GỐC + CHI TIẾT LỖI */}
            <div className="flex flex-col justify-between space-y-4 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>Bài làm gốc của bạn</span>
                </div>
                
                <div className="min-h-[120px] whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-relaxed text-slate-700">
                  &ldquo;{story}&rdquo;
                </div>

                {result.highlightedErrors && result.highlightedErrors.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                      <AlertTriangle className="h-3.5 w-3.5" /> Các điểm cần điều chỉnh ({result.highlightedErrors.length}):
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.highlightedErrors.map((errItem, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs">
                          <span className="font-medium text-rose-700 line-through">{errItem.error}</span>
                          <ArrowRight className="mx-2 h-3.5 w-3.5 shrink-0 text-slate-500" />
                          <span className="font-bold text-emerald-700">{errItem.correction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: BÀI SỬA CHUẨN + CỘNG ĐỒNG */}
            <div className="flex flex-col justify-between space-y-4 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  <CheckCheck className="h-4 w-4 text-emerald-600" />
                  <span>Bản gợi ý biên tập chuẩn hơn</span>
                </div>

                {result.correctedStory ? (
                  <div className="min-h-[120px] whitespace-pre-line rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium leading-relaxed italic text-sky-900">
                    &ldquo;{result.correctedStory}&rdquo;
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                    🎉 Bài viết của bạn đã rất tự nhiên và không cần sửa thêm!
                  </div>
                )}

                {result.communityStories && result.communityStories.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                      <Globe className="h-3.5 w-3.5" /> Tham khảo từ cộng đồng:
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.communityStories.slice(0, 5).map((item, idx) => (
                        <p key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs italic text-slate-600">
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
                type="button"
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white py-4 font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              >
                <RotateCcw className="w-4 h-4" />
                Sửa lại bài viết
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-4 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
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