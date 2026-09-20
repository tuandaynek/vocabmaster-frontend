import { useState, useEffect } from "react";
import type { CollocationReviewData } from "../types";
import { collocationApi } from "../api/collocationApi";
import { useSpeechPractice } from "../hooks/useSpeechPractice";
import { isWordInCollocation, getCleanWords } from "../utils/collocationUtils";

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

  // 1. Fetch 3 câu biến thể từ Backend (Fallback Mock nếu lỗi)
  useEffect(() => {
    const fetchVariations = async () => {
      setLoading(true);
      try {
        const response = await collocationApi.getVariations(
          collocation.collocationId || collocation.id,
        );

        const variationsList = response?.data ?? response?.variations ?? [];

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

  // 2. Tích hợp custom hook quản lý thu âm & lấy thêm resetSpeech
  const {
    isRecording,
    spokenText,
    score,
    startRecording,
    setScore,
    resetSpeech, // 👈 Lấy hàm reset từ hook ra
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
      <div className="flex flex-wrap justify-center items-center gap-2 leading-relaxed my-2">
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
                className={`text-xl font-bold transition-all px-2 py-0.5 rounded-md ${
                  isTargetCollocation
                    ? "text-yellow-300 bg-white/20 border-b-2 border-yellow-300 font-extrabold"
                    : "text-white"
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
                className={`text-lg font-extrabold px-2.5 py-1 rounded-xl border transition-all ${
                  isCorrect
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400"
                    : "bg-red-500/30 text-red-200 border-red-400"
                }`}
              >
                {word}
              </span>
              {!isCorrect && (
                <span className="mt-1 px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded bg-red-500 text-white shadow animate-bounce">
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
      <div className="max-w-md mx-auto p-12 bg-white rounded-3xl shadow-xl text-center border border-gray-100">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-gray-500">
          Đang tạo 3 câu biến thể cho bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 text-center">
      {/* Header Badge & Progress Indicator */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full tracking-wide">
          PHASE 3: VARIATION PRACTICE
        </span>
        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
          Biến thể {currentIndex + 1} / {variations.length}
        </span>
      </div>

      {/* Target Collocation Ribbon */}
      <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-xl text-purple-800 text-xs font-bold border border-purple-100">
        <span>🎯 Cụm từ trọng tâm:</span>
        <span className="text-purple-600 font-extrabold underline">
          {collocation.phrase}
        </span>
      </div>

      {/* Variation Card với Gradient Tím */}
      <div className="relative overflow-hidden my-3 p-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-3xl shadow-xl border-4 border-purple-300/40">
        <div className="absolute top-2 right-3 opacity-20 text-5xl font-serif">
          “
        </div>
        {renderSentenceWithFeedback()}

        {currentItem && (
          <div className="mt-3 pt-2 border-t border-white/20 text-[12.5px] text-purple-100 italic">
            💡 {currentItem.note}
          </div>
        )}
      </div>

      {/* Score Dashboard */}
      {score !== null && (
        <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center px-6">
          <div className="text-left">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Phản xạ biến thể
            </p>
            <p className="text-xs font-semibold text-slate-600">
              {score >= 80 ? "🎯 Phát âm chuẩn xác!" : "⚠️ Cần chuẩn xác hơn"}
            </p>
          </div>
          <div
            className={`text-3xl font-black ${
              score >= 80 ? "text-emerald-500" : "text-amber-500"
            }`}
          >
            {score}%
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="mt-6">
        {score === null ? (
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`w-full py-4 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isRecording
                ? "bg-red-500 animate-pulse shadow-red-200"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-200 active:scale-95"
            }`}
          >
            {isRecording
              ? "🎙️ Đang lắng nghe..."
              : "🎙️ Thu âm đọc câu biến thể"}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`flex-1 py-3.5 border-2 border-purple-500 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isRecording
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : ""
              }`}
            >
              {isRecording ? "🎙️ Đang lắng nghe..." : "🔄 Thu âm lại"}
            </button>

            <button
              onClick={handleNextVariation}
              className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5"
            >
              {currentIndex < variations.length - 1
                ? "Câu tiếp theo ➔"
                : "Hoàn tất Phase 3 ➔"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}