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

  return (
    <div className="max-w-md mx-auto p-7 bg-slate-950 border border-slate-800 rounded-[32px] shadow-2xl text-center relative transition-all">
      
      {/* Header Tag */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" /> PHASE 2: BASE SENTENCE
        </span>
        <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-2xl">
          Khung câu mẫu
        </span>
      </div>

      {/* Target Collocation Badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500/10 rounded-2xl text-indigo-300 text-xs font-bold border border-indigo-500/20">
        <span>🎯 Cụm trọng tâm:</span>
        <span className="text-indigo-400 font-black underline decoration-2 underline-offset-2">
          {collocation.phrase}
        </span>
      </div>

      {/* Main Sentence Card */}
      <div className="relative overflow-hidden my-3 p-6 bg-slate-900/60 rounded-3xl border border-slate-800 shadow-xl">
        <Quote className="absolute -top-1 -right-1 w-12 h-12 text-slate-800/40 rotate-180 pointer-events-none" />
        
        {renderSentenceWithFeedback()}

        {collocation.meaning && (
          <p className="mt-4 text-xs font-semibold text-slate-400 italic border-t border-slate-800 pt-3">
            💡 {collocation.meaning}
          </p>
        )}
      </div>

      {/* Audio Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={playAudio}
          disabled={isPlayingAudio}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl transition-all border ${
            isPlayingAudio
              ? "bg-sky-500/20 text-sky-300 border-sky-500/30 animate-pulse"
              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-bounce" : ""}`} />
          {isPlayingAudio ? "Đang phát mẫu..." : "Nghe chuẩn giọng đọc"}
        </button>
      </div>

      {/* Score Box */}
      {score !== null && (
        <div className="my-4 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-inner flex justify-between items-center px-5">
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Phản xạ câu
            </p>
            <p className="text-xs font-bold text-white mt-0.5">
              {score >= 80 ? "🎯 Đạt chuẩn phát âm!" : "⚠️ Cần chuẩn xác hơn"}
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
            disabled={isRecording || isPlayingAudio}
            className={`w-full py-4 text-white font-bold text-sm rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-xl ${
              isRecording
                ? "bg-rose-600 border-rose-500 animate-pulse"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 border-indigo-500 shadow-indigo-600/30"
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
              onClick={onComplete}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold text-xs rounded-2xl border border-indigo-500 transition-all shadow-xl flex items-center justify-center gap-1.5"
            >
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}