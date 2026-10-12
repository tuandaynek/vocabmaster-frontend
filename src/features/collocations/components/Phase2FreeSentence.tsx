import { useState } from "react";
import { Sparkles, AlertCircle, Trophy, Globe } from "lucide-react";
import { collocationApi } from "../api/collocationApi";
import type { EvaluatePhase2Response, CollocationReviewData } from "../types";

interface Props {
  collocation: CollocationReviewData;
  onNext: () => void;
}

export default function Phase2FreeSentence({ collocation, onNext }: Props) {
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluatePhase2Response | null>(null);

  // Trích xuất collocationId và phrase từ prop collocation
  const targetId = collocation.collocationId || (collocation as any).id;
  const phrase = collocation.phrase;

  const handleSubmit = async () => {
    if (!sentence.trim() || !targetId) return;
    try {
      setLoading(true);
      const res = await collocationApi.evaluatePhase2({
        collocationId: targetId,
        userSentence: sentence,
      });
      
      const evalData = (res as any)?.data ?? res;
      setResult(evalData);
    } catch (err) {
      console.error("Lỗi khi chấm điểm Phase 2:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:p-7">
      <div>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800">
          Phase 2: Tự đặt câu tự do
        </span>
        <h3 className="mt-3 text-lg font-bold text-slate-800">
          Hãy viết 1 câu có chứa cụm: <span className="text-emerald-700 underline">&ldquo;{phrase}&rdquo;</span>
        </h3>
      </div>

      <textarea
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        disabled={loading || !!result}
        placeholder="Nhập câu tiếng Anh của bạn tại đây..."
        className="h-32 w-full resize-none rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
      />

      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={loading || !sentence.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-4 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "AI đang thẩm định..." : "Gửi AI Chấm điểm"}
        </button>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* 3 STATES UI BADGES */}
          <div className={`p-4 rounded-2xl border ${
            result.state === "Not completed" ? "border-rose-200 bg-rose-50 text-rose-700" :
            result.state === "Good" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}>
            <div className="flex items-center gap-2">
              {result.state === "Not completed" && <AlertCircle className="h-5 w-5 text-rose-600" />}
              {result.state === "Good" && <Sparkles className="h-5 w-5 text-amber-600" />}
              {result.state === "Excellent" && <Trophy className="h-5 w-5 text-emerald-600" />}
              
              <span className="text-sm font-bold uppercase tracking-wider">
                Kết quả: {result.state}
              </span>
            </div>

            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-700">{result.feedback}</p>
            
            {result.correctedSentence && (
              <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs font-semibold text-sky-800">
                Gợi ý sửa: &ldquo;{result.correctedSentence}&rdquo;
              </p>
            )}
          </div>

          {/* DỮ LIỆU CỘNG ĐỒNG */}
          {result.communitySentences && result.communitySentences.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Globe className="h-4 w-4 text-sky-600" /> Tham khảo các câu Excellent khác từ cộng đồng:
              </p>
              <ul className="space-y-1.5 pl-1">
                {result.communitySentences.map((ex, idx) => (
                  <li key={idx} className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-700">
                    &bull; &ldquo;{ex}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          {result.state === "Not completed" ? (
            <button
              onClick={() => setResult(null)}
              className="w-full rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-4 font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
            >
              Thử lại câu khác
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-4 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              Tiếp tục sang Phase 3
            </button>
          )}

        </div>
      )}
    </div>
  );
}