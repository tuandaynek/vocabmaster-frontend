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
                className={`text-lg font-bold transition-all px-3 py-1.5 rounded-xl border ${
                  isTargetCollocation
                    ? "text-amber-300 bg-amber-500/15 border-amber-500/30 shadow-inner"
                    : "text-slate-200 bg-slate-900 border-slate-800"
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
                className={`text-lg font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  isCorrect
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                }`}
              >
                {word}
              </span>
              {!isCorrect && (
                <span className="mt-1.5 px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 shadow animate-bounce uppercase">
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
      <div className="max-w-md mx-auto p-10 bg-slate-950 border border-slate-800 rounded-[32px] shadow-2xl text-center">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-purple-300">
          Đang tạo các câu biến thể cho bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-7 bg-slate-950 border border-slate-800 rounded-[32px] shadow-2xl text-center relative transition-all">
      
      {/* Header Tag Cute & Progress Indicator */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-purple-500/10 text-purple-300 rounded-2xl border border-purple-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> PHASE 3: VARIATION
        </span>
        <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-2xl">
          Biến thể {currentIndex + 1}/{variations.length}
        </span>
      </div>

      {/* Target Collocation Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/10 rounded-2xl text-purple-300 text-xs font-bold border border-purple-500/20">
        <span>🎯 Cụm trọng tâm:</span>
        <span className="text-purple-400 font-black underline decoration-2 underline-offset-2">
          {collocation.phrase}
        </span>
      </div>

      {/* Variation Sentence Card */}
      <div className="relative overflow-hidden my-3 p-6 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl">
        <Quote className="absolute -top-1 -right-1 w-12 h-12 text-slate-800/40 rotate-180 pointer-events-none" />

        {renderSentenceWithFeedback()}

        {currentItem && (
          <div className="mt-4 text-xs font-semibold text-slate-400 italic border-t border-slate-800 pt-3">
            💡 {currentItem.note}
          </div>
        )}
      </div>

      {/* Score Box */}
      {score !== null && (
        <div className="my-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-inner flex justify-between items-center px-5">
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Phản xạ biến thể
            </p>
            <p className="text-xs font-bold text-white mt-0.5">
              {score >= 80 ? "🎯 Phát âm chuẩn xác!" : "⚠️ Cần chuẩn xác hơn"}
            </p>
          </div>
          <div
            className={`text-3xl font-black ${
              score >= 80 ? "text-emerald-400" : "text-amber-400"
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
            className={`w-full py-4 text-white font-bold text-sm rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-xl ${
              isRecording
                ? "bg-rose-600 border-rose-500 animate-pulse"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 border-purple-500 shadow-purple-600/30"
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
              className={`flex-1 py-3.5 border border-slate-700 bg-slate-900 text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 ${
                isRecording
                  ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                  : ""
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRecording ? "animate-spin" : ""}`} />
              {isRecording ? "Lắng nghe..." : "Thu âm lại"}
            </button>

            <button
              onClick={handleNextVariation}
              className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-2xl border border-purple-500 transition-all shadow-xl flex items-center justify-center gap-1.5"
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