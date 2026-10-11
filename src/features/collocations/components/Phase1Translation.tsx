import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, HelpCircle, Loader2 } from "lucide-react";
import { collocationApi } from "@/features/collocations/api/collocationApi";
import type { Phase1DataResponse, CollocationReviewData } from "../types";

interface Props {
  collocation: CollocationReviewData;
  onNext: () => void;
}

export default function Phase1Translation({ collocation, onNext }: Props) {
  const [phaseData, setPhaseData] = useState<Phase1DataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [input, setInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const fetchTranslationData = async () => {
      const targetId = collocation.collocationId || (collocation as any).id;
      if (!targetId) return;

      try {
        setLoading(true);
        const res = await collocationApi.getPhase1Translation(targetId);
        const raw = (res as any)?.data ?? res;

        // Map dữ liệu từ snake_case sang camelCase
        const normalizedData: Phase1DataResponse = {
          viSentence: raw?.viSentence || raw?.vi_sentence || "",
          acceptedAnswer: raw?.acceptedAnswer || raw?.accepted_answer || "",
          suggestedVocab: (
            raw?.suggestedVocab ||
            raw?.suggest_vocab ||
            raw?.suggested_vocab ||
            []
          ).map((v: any) => ({
            word: v.word,
            meaning: v.meaning,
          })),
        };

        setPhaseData(normalizedData);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu Phase 1 Translation:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchTranslationData();
  }, [collocation]);

  const handleCheck = () => {
    if (!input.trim()) return;
    setIsSubmitted(true);
  };

  if (loading) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-8 shadow-2xl flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-xs font-bold text-slate-400">
          Đang khởi tạo bài tập dịch thuật...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-7 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
          Phase 1: Dịch câu đơn giản
        </span>
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs font-bold text-amber-400 flex items-center gap-1 hover:underline"
        >
          <HelpCircle className="w-4 h-4" />{" "}
          {showHint ? "Ẩn gợi ý" : "Gợi ý từ vựng"}
        </button>
      </div>

      {/* Câu Tiếng Việt từ AI/Cache */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Dịch câu sau sang tiếng Anh:
        </p>
        <p className="text-base font-bold text-white mt-1.5">
          &ldquo;{phaseData?.viSentence || "Đang tải câu dịch..."}&rdquo;
        </p>
      </div>

      {/* Gợi ý Từ Vựng */}
      {showHint &&
        phaseData?.suggestedVocab &&
        phaseData.suggestedVocab.length > 0 && (
          <div className="flex flex-wrap gap-2 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
            {phaseData.suggestedVocab.map((v, i) => (
              <span
                key={i}
                className="text-xs font-bold text-amber-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-500/30"
              >
                {v.word}: <span className="font-normal text-slate-300">{v.meaning}</span>
              </span>
            ))}
          </div>
        )}

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isSubmitted}
        placeholder="Gõ bản dịch đơn giản nhất của bạn..."
        className="w-full p-4 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none font-medium text-sm resize-none h-28 transition"
      />

      {!isSubmitted ? (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:opacity-90 text-white font-bold rounded-2xl border border-sky-500 shadow-lg shadow-sky-600/30 disabled:opacity-50 transition"
        >
          Kiểm tra đáp án
        </button>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Đáp án gợi ý tự nhiên nhất:
            </p>
            <p className="text-sm font-bold text-emerald-200 mt-1.5">
              &ldquo;{phaseData?.acceptedAnswer}&rdquo;
            </p>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold rounded-2xl border border-emerald-500 shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            Chuyển sang Phase 2 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
