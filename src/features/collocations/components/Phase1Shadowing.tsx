import { useState, useEffect, useRef } from "react";
import type { CollocationReviewData } from "../types";
import { Mic, Volume2, Sparkles, AlertCircle, Award, CheckCircle2 } from "lucide-react";

interface Phase1ShadowingProps {
  collocation: CollocationReviewData;
  onComplete: () => void;
}

interface AttemptResult {
  attemptIndex: number;
  score: number;
  spokenText: string;
}

export default function Phase1Shadowing({ collocation, onComplete }: Phase1ShadowingProps) {
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(1);
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [stage, setStage] = useState<"NORMAL" | "BONUS" | "COMPLETED">("NORMAL");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const audioRef = useRef(new Audio(collocation.audioUrl || undefined));
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    playSampleAudio();
  }, []);

  const playSampleAudio = (onEndedCallback?: () => void) => {
    setIsPlayingAudio(true);
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .catch(() => {
        setIsPlayingAudio(false);
        if (onEndedCallback) onEndedCallback();
      });

    audioRef.current.onended = () => {
      setIsPlayingAudio(false);
      if (onEndedCallback) onEndedCallback();
    };
  };

  // Tính điểm & Đánh giá (GIỮ NGUYÊN LOGIC)
  const evaluateSpeech = (spoken: string) => {
    setResetMessage(null);
    const targetWords = collocation.phrase
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/);

    const spokenWords = spoken
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/);

    let correctCount = 0;
    targetWords.forEach((word, idx) => {
      if (spokenWords[idx] === word) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / targetWords.length) * 100);
    const finalScore = Math.min(100, Math.max(0, calculatedScore));

    const newAttemptIndex = stage === "BONUS" ? 4 : currentAttempt;
    const newAttempt: AttemptResult = {
      attemptIndex: newAttemptIndex,
      score: finalScore,
      spokenText: spoken,
    };

    const updatedAttempts =
      stage === "BONUS"
        ? [...attempts, newAttempt]
        : [...attempts.filter((a) => a.attemptIndex !== currentAttempt), newAttempt];

    setAttempts(updatedAttempts);
    setSelectedAttemptIndex(newAttemptIndex);

    if (stage === "BONUS") {
      if (finalScore === 100) {
        setStage("COMPLETED");
      } else {
        setResetMessage("Chưa đạt 100% ở lượt quyết định! Đang khởi động lại 3 lượt thử...");
        setTimeout(() => {
          setAttempts([]);
          setCurrentAttempt(1);
          setSelectedAttemptIndex(1);
          setStage("NORMAL");
          setResetMessage(null);
          playSampleAudio();
        }, 2000);
      }
    } else if (currentAttempt < 3) {
      setTimeout(() => {
        playSampleAudio(() => {
          setCurrentAttempt((prev) => prev + 1);
          setSelectedAttemptIndex((prev) => prev + 1);
        });
      }, 600);
    } else {
      const lastAttemptScore = finalScore;
      const first2 = updatedAttempts.filter((a) => a.attemptIndex <= 2);
      const avgFirst2 =
        first2.length > 0
          ? first2.reduce((sum, a) => sum + a.score, 0) / first2.length
          : 0;

      const condition1 = lastAttemptScore < 100;
      const condition2 = lastAttemptScore === 100 && avgFirst2 < 80;

      if (condition1 || condition2) {
        setStage("BONUS");
      } else {
        setStage("COMPLETED");
      }
    }
  };

  const handleRecord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Google Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      evaluateSpeech(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      evaluateSpeech("");
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Render Cụm từ Cute dạng Badge Bong Bóng
  const renderInteractivePhrase = () => {
    const targetWords = collocation.phrase.trim().split(/\s+/);
    const activeAttemptData = attempts.find((a) => a.attemptIndex === selectedAttemptIndex);

    if (!activeAttemptData) {
      return (
        <h2 className="text-3xl font-black text-white tracking-tight mt-2">
          {collocation.phrase}
        </h2>
      );
    }

    const spokenWords = activeAttemptData.spokenText
      .trim()
      .toLowerCase()
      .replace(/[.,/#!\$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/);

    return (
      <div className="flex flex-wrap justify-center items-start gap-2.5 mt-2 min-h-[95px]">
        {targetWords.map((word, idx) => {
          const cleanTarget = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
          const spokenAtIdx = spokenWords[idx];

          let isCorrect = spokenAtIdx === cleanTarget;
          let isMissing = !spokenAtIdx;

          return (
            <div key={idx} className="flex flex-col items-center">
              <span
                className={`text-2xl font-black px-4 py-2 rounded-2xl border transition-all ${
                  isCorrect
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/10"
                }`}
              >
                {word}
              </span>

              {!isCorrect && (
                <span className="mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 shadow animate-bounce">
                  {isMissing ? "⚠️ thiếu" : `≠ "${spokenAtIdx}"`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const firstScore = attempts.find((a) => a.attemptIndex === 1)?.score ?? null;
  const lastScore = attempts.length > 0 ? attempts[attempts.length - 1].score : null;

  return (
    <div className="max-w-md mx-auto p-7 bg-slate-950 border border-slate-800 rounded-[32px] shadow-2xl text-center relative transition-all">
      
      {/* Header Tag */}
      <div className="flex justify-between items-center mb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" /> PHASE 1: DEEP SHADOWING
        </span>
        <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-2xl">
          Lượt:{" "}
          <span className="text-sky-400 font-bold">
            {selectedAttemptIndex}/{stage === "BONUS" ? 4 : 3}
          </span>
        </span>
      </div>

      {/* Main Phrase & Meaning */}
      {renderInteractivePhrase()}
      <p className="text-slate-400 font-medium italic text-sm mt-3 mb-5 bg-slate-900/60 py-2 px-4 rounded-2xl inline-block border border-slate-800">
        &ldquo;{collocation.meaning}&rdquo;
      </p>

      {/* Điểm số */}
      <div className="grid grid-cols-2 gap-3 my-5">
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-inner">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LẦN 1</p>
          <p className="text-2xl font-black text-white mt-0.5">
            {firstScore !== null ? `${firstScore}%` : "--"}
          </p>
        </div>
        <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 shadow-inner">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">LẦN MỚI NHẤT</p>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">
            {lastScore !== null ? `${lastScore}%` : "--"}
          </p>
        </div>
      </div>

      {/* Nút bấm chuyển lượt */}
      <div className="flex justify-center gap-2.5 mb-5">
        {[1, 2, 3, ...(stage === "BONUS" ? [4] : [])].map((step) => {
          const attemptData = attempts.find((a) => a.attemptIndex === step);
          const isSelected = selectedAttemptIndex === step;
          const isCurrentAction = currentAttempt === step && stage === "NORMAL";

          return (
            <button
              key={step}
              onClick={() => {
                if (attemptData) setSelectedAttemptIndex(step);
              }}
              disabled={!attemptData}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold transition-all border ${
                isSelected ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-105" : ""
              } ${
                attemptData
                  ? attemptData.score === 100
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30"
                  : isCurrentAction
                  ? "bg-sky-500/10 border-sky-400 text-sky-400 animate-pulse border-2"
                  : "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {step === 4 ? <Award className="w-4 h-4 text-white" /> : attemptData ? `${attemptData.score}%` : step}
            </button>
          );
        })}
      </div>

      {/* Thông báo trạng thái */}
      <div className="min-h-[48px] flex flex-col items-center justify-center text-xs font-bold">
        {resetMessage && (
          <p className="text-rose-400 bg-rose-500/10 px-3.5 py-1.5 rounded-2xl border border-rose-500/20 animate-bounce flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {resetMessage}
          </p>
        )}

        {!resetMessage && isPlayingAudio && (
          <p className="text-sky-400 bg-sky-500/10 px-3.5 py-1.5 rounded-2xl border border-sky-500/20 animate-pulse flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 animate-bounce" /> Đang phát âm chuẩn... Hãy chú ý nhại theo!
          </p>
        )}

        {!resetMessage && !isPlayingAudio && stage === "BONUS" && !isRecording && (
          <p className="text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-2xl border border-amber-500/20 shadow-sm flex items-center gap-1.5">
            ⚠️ Lượt Quyết Định! Cần đạt 100% để qua bài.
          </p>
        )}

        {stage === "COMPLETED" && (
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-3 rounded-2xl font-bold text-xs w-full flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hoàn thành xuất sắc Phase 1!
          </div>
        )}
      </div>

      {/* Nút hành động chính */}
      <div className="mt-4">
        {stage !== "COMPLETED" ? (
          <button
            onClick={handleRecord}
            disabled={isRecording || isPlayingAudio || !!resetMessage}
            className={`w-full py-4 text-white font-bold text-sm rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-xl ${
              isRecording
                ? "bg-rose-600 border-rose-500 animate-pulse"
                : stage === "BONUS"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 border-amber-500 shadow-amber-600/30"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 border-indigo-500 shadow-indigo-600/30"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Mic className="w-4 h-4" />
            {isRecording
              ? "Đang lắng nghe..."
              : stage === "BONUS"
              ? "Thu Âm Quyết Định (Cần 100%)"
              : `Thu âm Lượt ${currentAttempt}/3`}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            Hoàn thành Phase 1 ➔
          </button>
        )}
      </div>

    </div>
  );
}