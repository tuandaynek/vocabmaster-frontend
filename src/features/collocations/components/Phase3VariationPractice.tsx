import { useState, useEffect } from "react";
import type { CollocationReviewData } from "../types";
import { collocationApi } from "../api/collocationApi";
import { useSpeechPractice } from "../hooks/useSpeechPractice";
import { isWordInCollocation, getCleanWords } from "../utils/collocationUtils";
import { Mic, Sparkles, RefreshCw, ArrowRight, Quote, Loader2, Award } from "lucide-react";

interface VariationItem {
  id: number;
  type: string;
  sentence: string;
  note: string;
}

interface Phase3Props {
  collocation: CollocationReviewData;
  onComplete: () => void;
}

export default function Phase3VariationPractice({
  collocation,
  onComplete,
}: Phase3Props) {
  const [variations, setVariations] = useState<VariationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const baseSentence =
    collocation.baseSentence ||
    collocation.sample_sentences?.[0] ||
    `Buying products with less packaging is a good way to ${collocation.phrase}.`;

  // 1. Fetch 3 câu biến thể từ Backend (GIỮ NGUYÊN LOGIC & FALLBACK)
  useEffect(() => {
    const fetchVariations = async () => {
      setLoading(true);
      try {
        const response = await collocationApi.getVariations(
          collocation.collocationId || collocation.id,
        );

        const variationsList = response?.data?.variations ?? response?.variations ?? [];

        if (variationsList.length > 0) {
          setVariations(variationsList);
        } else {
          throw new Error("Empty variations list");
        }
      } catch (err) {
        console.warn("API Call failed, using Mock Data fallback:", err);
        setVariations([
          {
            id: 1,
            type: "Synonym Swap",
            sentence: baseSentence
              .replace(/products/i, "goods")
              .replace(/a good way/i, "a great way"),
            note: "Thay 'products' ➔ 'goods', 'a good way' ➔ 'a great way'",
          },
          {
            id: 2,
            type: "Structure Shift",
            sentence: `People should buy products with less packaging to ${collocation.phrase}.`,
            note: "Đổi sang cấu trúc 'People should...'",
          },
          {
            id: 3,
            type: "Gentle Upgrade",
            sentence: `We should avoid buying items with too much packaging to ${collocation.phrase}.`,
            note: "Đổi góc nhìn 'Tránh mua đồ nhiều packaging...'",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVariations();
  }, [collocation, baseSentence]);

  const currentItem = variations[currentIndex];

  // 2. Custom hook quản lý thu âm (GIỮ NGUYÊN LOGIC)
  const {
    isRecording,
    spokenText,
    score,
    startRecording,
    setScore,
    resetSpeech,
  } = useSpeechPractice({
    targetSentence: currentItem?.sentence || "",
  });

  // Tự động xoá dữ liệu thu âm cũ mỗi khi chuyển sang câu biến thể mới
  useEffect(() => {
    if (resetSpeech) {
      resetSpeech();
    } else {
      setScore(null);
    }
  }, [currentIndex]);

  // Chuyển câu biến thể tiếp theo hoặc hoàn thành Phase 3
  const handleNextVariation = () => {
    if (currentIndex < variations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const renderSentenceWithFeedback = () => {
    if (!currentItem) return null;

    const rawWords = currentItem.sentence.split(/\s+/);
    const targetWordsClean = getCleanWords(currentItem.sentence);
    const spokenWordsClean = spokenText ? getCleanWords(spokenText) : [];

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 leading-relaxed my-2 min-h-[80px]">
        {rawWords.map((word, idx) => {
          const cleanWord = targetWordsClean[idx];
          const spokenAtIdx = spokenWordsClean[idx];
          const isTargetCollocation = isWordInCollocation(
            idx,
            currentItem.sentence,
            collocation.phrase
          );

          if (!spokenText) {
            return (
              <span
                key={idx}
                className={`rounded-2xl border-2 px-3 py-1.5 text-lg font-bold transition-all ${
                  isTargetCollocation
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {word}
              </span>
            );
          }

          const isCorrect = spokenAtIdx === cleanWord;
          const isMissing = !spokenAtIdx;

          return (
            <div key={idx} className="flex flex-col items-center">
              <span
                className={`rounded-2xl border-2 px-3 py-1.5 text-lg font-bold transition-all ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {word}
              </span>
              {!isCorrect && (
                <span className="mt-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 shadow-sm">
                  {isMissing ? "thiếu" : `≠ "${spokenAtIdx}"`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-slate-100 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-600">
          Đang tạo các câu biến thể cho bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md rounded-3xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm transition-all sm:p-7">
      
      {/* Header Tag Cute & Progress Indicator */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-violet-600" /> PHASE 3: VARIATION
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
          Biến thể {currentIndex + 1}/{variations.length}
        </span>
      </div>

      {/* Target Collocation Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800">
        <span>🎯 Cụm trọng tâm:</span>
        <span className="font-extrabold text-amber-800 underline decoration-2 underline-offset-2">
          {collocation.phrase}
        </span>
      </div>

      {/* Variation Sentence Card */}
      <div className="relative my-3 overflow-hidden rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 shadow-sm">
        <Quote className="pointer-events-none absolute -right-1 -top-1 h-12 w-12 rotate-180 text-slate-200" />

        {renderSentenceWithFeedback()}

        {currentItem && (
          <div className="mt-4 border-t border-slate-200 pt-3 text-xs font-semibold italic text-slate-500">
            💡 {currentItem.note}
          </div>
        )}
      </div>

      {/* Score Box */}
      {score !== null && (
        <div className="my-4 flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-5 p-4 shadow-sm">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Phản xạ biến thể
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-800">
              {score >= 80 ? "🎯 Phát âm chuẩn xác!" : "⚠️ Cần chuẩn xác hơn"}
            </p>
          </div>
          <div
            className={`text-3xl font-black ${
              score >= 80 ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {score}%
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="mt-5">
        {score === null ? (
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-4 text-sm font-bold text-white shadow-sm transition-all duration-150 active:translate-y-1 active:border-b-0 ${
              isRecording
                ? "border-rose-700 bg-rose-500 animate-pulse"
                : "border-emerald-700 bg-emerald-500 hover:bg-emerald-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="w-4 h-4" />
            {isRecording ? "Đang lắng nghe..." : "Thu âm đọc câu biến thể"}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-b-4 border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2 ${
                isRecording
                  ? "border-rose-700 bg-rose-500 text-white animate-pulse"
                  : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRecording ? "animate-spin" : ""}`} />
              {isRecording ? "Lắng nghe..." : "Thu âm lại"}
            </button>

            <button
              onClick={handleNextVariation}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              {currentIndex < variations.length - 1 ? (
                <>
                  Câu tiếp theo <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Hoàn tất Phase 3 <Award className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}