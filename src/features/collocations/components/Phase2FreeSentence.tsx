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
    <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-7 shadow-2xl space-y-6">
      <div>
        <span className="px-3.5 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
          Phase 2: Tự đặt câu tự do
        </span>
        <h3 className="text-lg font-bold text-white mt-3">
          Hãy viết 1 câu có chứa cụm: <span className="text-purple-400 underline">&ldquo;{phrase}&rdquo;</span>
        </h3>
      </div>

      <textarea
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        disabled={loading || !!result}
        placeholder="Nhập câu tiếng Anh của bạn tại đây..."
        className="w-full p-4 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none font-medium text-sm resize-none h-32 transition"
      />

      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={loading || !sentence.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-2xl border border-purple-500 shadow-lg shadow-purple-600/30 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading ? "AI đang thẩm định..." : "Gửi AI Chấm điểm"}
        </button>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* 3 STATES UI BADGES */}
          <div className={`p-4 rounded-2xl border ${
            result.state === "Not completed" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" :
            result.state === "Good" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}>
            <div className="flex items-center gap-2">
              {result.state === "Not completed" && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {result.state === "Good" && <Sparkles className="w-5 h-5 text-amber-400" />}
              {result.state === "Excellent" && <Trophy className="w-5 h-5 text-emerald-400" />}
              
              <span className="text-sm font-bold uppercase tracking-wider">
                Kết quả: {result.state}
              </span>
            </div>

            <p className="text-xs font-medium mt-2 leading-relaxed text-slate-200">{result.feedback}</p>
            
            {result.correctedSentence && (
              <p className="text-xs font-semibold text-indigo-300 mt-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                Gợi ý sửa: &ldquo;{result.correctedSentence}&rdquo;
              </p>
            )}
          </div>

          {/* DỮ LIỆU CỘNG ĐỒNG */}
          {result.communitySentences && result.communitySentences.length > 0 && (
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400" /> Tham khảo các câu Excellent khác từ cộng đồng:
              </p>
              <ul className="space-y-1.5 pl-1">
                {result.communitySentences.map((ex, idx) => (
                  <li key={idx} className="text-xs font-medium text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
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
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 transition shadow-lg"
            >
              Thử lại câu khác
            </button>
          ) : (
            <button
              onClick={onNext}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-2xl border border-emerald-500 shadow-lg shadow-emerald-600/30 transition"
            >
              Tiếp tục sang Phase 3
            </button>
          )}

        </div>
      )}
    </div>
  );
}