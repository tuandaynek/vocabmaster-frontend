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
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-slate-100 bg-white p-8 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">
          Đang khởi tạo bài tập dịch thuật...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800">
          Phase 1: Dịch câu đơn giản
        </span>
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-50 hover:underline"
        >
          <HelpCircle className="w-4 h-4" />{" "}
          {showHint ? "Ẩn gợi ý" : "Gợi ý từ vựng"}
        </button>
      </div>

      {/* Câu Tiếng Việt từ AI/Cache */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Dịch câu sau sang tiếng Anh:
        </p>
        <p className="mt-1.5 text-base font-bold text-slate-800">
          &ldquo;{phaseData?.viSentence || "Đang tải câu dịch..."}&rdquo;
        </p>
      </div>

      {/* Gợi ý Từ Vựng */}
      {showHint &&
        phaseData?.suggestedVocab &&
        phaseData.suggestedVocab.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            {phaseData.suggestedVocab.map((v, i) => (
              <span
                key={i}
                className="rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-800"
              >
                {v.word}: <span className="font-normal text-slate-600">{v.meaning}</span>
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
        className="h-28 w-full resize-none rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
      />

      {!isSubmitted ? (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className="flex w-full items-center justify-center rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-4 font-bold text-amber-950 shadow-sm transition-all duration-150 hover:bg-amber-500 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Kiểm tra đáp án
        </button>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Đáp án gợi ý tự nhiên nhất:
            </p>
            <p className="mt-1.5 text-sm font-bold text-emerald-800">
              &ldquo;{phaseData?.acceptedAnswer}&rdquo;
            </p>
          </div>

          <button
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-4 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
          >
            Chuyển sang Phase 2 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
