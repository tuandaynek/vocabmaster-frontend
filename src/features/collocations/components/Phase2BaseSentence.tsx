import { useRef, useState } from "react";
import type { CollocationReviewData } from "../types";
import { useSpeechPractice } from "../hooks/useSpeechPractice";
import { isWordInCollocation, getCleanWords } from "../utils/collocationUtils";

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

  // Tích hợp custom hook quản lý thu âm, nhận diện & tính điểm
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
      <div className="flex flex-wrap justify-center items-center gap-2 leading-relaxed my-2">
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100 text-center">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold px-3 py-1 bg-sky-100 text-sky-700 rounded-full tracking-wide">
          PHASE 2: BASE SENTENCE
        </span>
        <span className="text-xs font-semibold text-gray-400">
          Khung câu mẫu
        </span>
      </div>

      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-xl text-sky-800 text-xs font-bold border border-sky-100">
        <span>🎯 Cụm từ trọng tâm:</span>
        <span className="text-sky-600 font-extrabold underline">
          {collocation.phrase}
        </span>
      </div>

      <div className="relative overflow-hidden my-4 p-6 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-3xl shadow-xl border-4 border-sky-300/40">
        <div className="absolute top-2 right-3 opacity-20 text-5xl font-serif">
          “
        </div>
        {renderSentenceWithFeedback()}

        {collocation.meaning && (
          <p className="mt-3 text-xs text-sky-100 italic border-t border-white/20 pt-2">
            💡 {collocation.meaning}
          </p>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={playAudio}
          disabled={isPlayingAudio}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition shadow-sm ${
            isPlayingAudio
              ? "bg-sky-200 text-sky-700 animate-pulse"
              : "bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100"
          }`}
        >
          {isPlayingAudio ? "🔊 Đang phát..." : "🔊 Nghe chuẩn giọng đọc"}
        </button>
      </div>

      {score !== null && (
        <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center px-6">
          <div className="text-left">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Phản xạ câu
            </p>
            <p className="text-xs font-semibold text-slate-600">
              {score >= 80 ? "🎯 Đạt chuẩn phát âm!" : "⚠️ Cần chuẩn xác hơn"}
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
            disabled={isRecording || isPlayingAudio}
            className={`w-full py-4 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              isRecording
                ? "bg-red-500 animate-pulse shadow-red-200"
                : "bg-sky-600 hover:bg-sky-700 shadow-sky-200 active:scale-95"
            }`}
          >
            {isRecording
              ? "🎙️ Đang lắng nghe..."
              : "🎙️ Thu âm đọc toàn bộ câu"}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={startRecording}
              disabled={isRecording || isPlayingAudio}
              className={`flex-1 py-3.5 border-2 border-sky-500 text-sky-600 font-bold rounded-2xl hover:bg-sky-50 transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                isRecording
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : ""
              }`}
            >
              {isRecording ? "🎙️ Đang lắng nghe..." : "🔄 Thu âm lại"}
            </button>

            <button
              onClick={onComplete}
              className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5"
            >
              Tiếp tục ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
}