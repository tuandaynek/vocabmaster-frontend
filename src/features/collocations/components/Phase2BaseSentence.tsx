import { useRef, useState } from "react";
import type { CollocationReviewData } from "../types";
import { useSpeechPractice } from "../hooks/useSpeechPractice";
import { isWordInCollocation, getCleanWords } from "../utils/collocationUtils";
import { Mic, Volume2, Sparkles, RefreshCw, ArrowRight, Quote } from "lucide-react";

interface Phase2Props {
  collocation: CollocationReviewData;
  onComplete: () => void;
}

export default function Phase2BaseSentence({
  collocation,
  onComplete,
}: Phase2Props) {
  const baseSentence =
    collocation.baseSentence ||
    collocation.sample_sentences?.[0] ||
    `I'd like to ${collocation.phrase}`;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(new Audio(collocation.audioUrl || undefined));

  // Tích hợp custom hook quản lý thu âm, nhận diện & tính điểm (GIỮ NGUYÊN LOGIC)
  const { isRecording, spokenText, score, startRecording } = useSpeechPractice({
    targetSentence: baseSentence,
  });

  const playAudio = () => {
    setIsPlayingAudio(true);
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.onended = () => setIsPlayingAudio(false);
      })
      .catch(() => setIsPlayingAudio(false));
  };

  const renderSentenceWithFeedback = () => {
    const rawWords = baseSentence.split(/\s+/);
    const targetWordsClean = getCleanWords(baseSentence);
    const spokenWordsClean = spokenText ? getCleanWords(spokenText) : [];

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 leading-relaxed my-2 min-h-[80px]">
        {rawWords.map((word, idx) => {
          const cleanWord = targetWordsClean[idx];
          const spokenAtIdx = spokenWordsClean[idx];
          const isTargetCollocation = isWordInCollocation(
            idx,
            baseSentence,
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

  return (
    <div className="relative mx-auto max-w-md rounded-3xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm transition-all sm:p-7">
      
      {/* Header Tag */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" /> PHASE 2: BASE SENTENCE
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          Khung câu mẫu
        </span>
      </div>

      {/* Target Collocation Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800">
        <span>🎯 Cụm trọng tâm:</span>
        <span className="font-extrabold text-amber-800 underline decoration-2 underline-offset-2">
          {collocation.phrase}
        </span>
      </div>

      {/* Main Sentence Card */}
      <div className="relative my-3 overflow-hidden rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 shadow-sm">
        <Quote className="pointer-events-none absolute -right-1 -top-1 h-12 w-12 rotate-180 text-slate-200" />
        
        {renderSentenceWithFeedback()}

        {collocation.meaning && (
          <p className="mt-4 border-t border-slate-200 pt-3 text-xs font-semibold italic text-slate-500">
            💡 {collocation.meaning}
          </p>
        )}
      </div>

      {/* Audio Button */}
      <div className="mb-4 flex justify-center">
        <button
          type="button"
          onClick={playAudio}
          disabled={isPlayingAudio}
          className={`flex items-center gap-2 rounded-2xl border-2 border-b-4 px-4 py-2 text-xs font-bold transition-all duration-150 active:translate-y-1 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            isPlayingAudio
              ? "border-sky-200 bg-sky-50 text-sky-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-bounce" : ""}`} />
          {isPlayingAudio ? "Đang phát mẫu..." : "Nghe chuẩn giọng đọc"}
        </button>
      </div>

      {/* Score Box */}
      {score !== null && (
        <div className="my-4 flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-5 p-4 shadow-sm">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Phản xạ câu
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-800">
              {score >= 80 ? "🎯 Đạt chuẩn phát âm!" : "⚠️ Cần chuẩn xác hơn"}
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
            disabled={isRecording || isPlayingAudio}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-4 text-sm font-bold text-white shadow-sm transition-all duration-150 active:translate-y-1 active:border-b-0 ${
              isRecording
                ? "border-rose-700 bg-rose-500 animate-pulse"
                : "border-emerald-700 bg-emerald-500 hover:bg-emerald-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="w-4 h-4" />
            {isRecording ? "Đang lắng nghe..." : "Thu âm đọc toàn bộ câu"}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              disabled={isRecording || isPlayingAudio}
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
              onClick={onComplete}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}