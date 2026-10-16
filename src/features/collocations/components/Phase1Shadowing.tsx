import { useCallback, useState, useEffect, useRef } from "react";
import type { CollocationReviewData } from "../types";
import type { SpeechRecognitionLike } from "../types/speechRecognition";
import { getSpeechRecognitionConstructor } from "../utils/speechRecognition";
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
  const [speechError, setSpeechError] = useState<string | null>(null);

  const audioRef = useRef(new Audio(collocation.audioUrl || undefined));
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const playSampleAudio = useCallback((onEndedCallback?: () => void) => {
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
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const autoplayTimer = window.setTimeout(playSampleAudio, 0);
    return () => {
      window.clearTimeout(autoplayTimer);
      audio.pause();
      recognitionRef.current?.stop();
    };
  }, [playSampleAudio]);

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
    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setSpeechError("Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Google Chrome!");
      return;
    }

    setSpeechError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      evaluateSpeech(transcript);
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      setSpeechError(
        event.error === "not-allowed"
          ? "Vui lòng cấp quyền sử dụng micro để luyện nói."
          : "Không thể nhận diện giọng nói. Vui lòng thử lại.",
      );
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
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
          {collocation.phrase}
        </h2>
      );
    }

    const spokenWords = activeAttemptData.spokenText
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/);

    return (
      <div className="flex flex-wrap justify-center items-start gap-2.5 mt-2 min-h-[95px]">
        {targetWords.map((word, idx) => {
          const cleanTarget = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
          const spokenAtIdx = spokenWords[idx];

          const isCorrect = spokenAtIdx === cleanTarget;
          const isMissing = !spokenAtIdx;

          return (
            <div key={idx} className="flex flex-col items-center">
              <span
                className={`rounded-2xl border-2 px-4 py-2 text-2xl font-extrabold transition-all ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {word}
              </span>

              {!isCorrect && (
                <span className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 shadow-sm">
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
    <div className="relative mx-auto max-w-md rounded-3xl border-2 border-slate-100 bg-white p-6 text-center shadow-sm transition-all sm:p-7">
      
      {/* Header Tag */}
      <div className="flex justify-between items-center mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" /> PHASE 1: DEEP SHADOWING
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          Lượt:{" "}
          <span className="font-bold text-sky-700">
            {selectedAttemptIndex}/{stage === "BONUS" ? 4 : 3}
          </span>
        </span>
      </div>

      {/* Main Phrase & Meaning */}
      {renderInteractivePhrase()}
      <p className="mb-5 mt-3 inline-block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium italic text-slate-600">
        &ldquo;{collocation.meaning}&rdquo;
      </p>

      {/* Điểm số */}
      <div className="grid grid-cols-2 gap-3 my-5">
        <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">LẦN 1</p>
          <p className="mt-0.5 text-2xl font-extrabold text-slate-800">
            {firstScore !== null ? `${firstScore}%` : "--"}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">LẦN MỚI NHẤT</p>
          <p className="mt-0.5 text-2xl font-extrabold text-emerald-700">
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
              type="button"
              onClick={() => {
                if (attemptData) setSelectedAttemptIndex(step);
              }}
              disabled={!attemptData}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-xs font-bold transition-all ${
                isSelected ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-white scale-105" : ""
              } ${
                attemptData
                  ? attemptData.score === 100
                    ? "border-emerald-700 bg-emerald-500 text-white shadow-sm"
                    : "border-amber-600 bg-amber-400 text-amber-950 shadow-sm"
                  : isCurrentAction
                  ? "border-sky-300 bg-sky-50 text-sky-700 animate-pulse"
                  : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              }`}
            >
              {step === 4 ? <Award className="w-4 h-4 text-white" /> : attemptData ? `${attemptData.score}%` : step}
            </button>
          );
        })}
      </div>

      {/* Thông báo trạng thái */}
      <div className="min-h-[48px] flex flex-col items-center justify-center text-xs font-bold">
        {speechError && (
          <p role="alert" className="mb-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-rose-700">
            {speechError}
          </p>
        )}
        {resetMessage && (
          <p className="flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-rose-700">
            <AlertCircle className="w-4 h-4" /> {resetMessage}
          </p>
        )}

        {!resetMessage && isPlayingAudio && (
          <p className="flex items-center gap-1.5 rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-sky-700 animate-pulse">
            <Volume2 className="w-4 h-4 animate-bounce" /> Đang phát âm chuẩn... Hãy chú ý nhại theo!
          </p>
        )}

        {!resetMessage && !isPlayingAudio && stage === "BONUS" && !isRecording && (
          <p className="flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-1.5 text-amber-800 shadow-sm">
            ⚠️ Lượt Quyết Định! Cần đạt 100% để qua bài.
          </p>
        )}

        {stage === "COMPLETED" && (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Hoàn thành xuất sắc Phase 1!
          </div>
        )}
      </div>

      {/* Nút hành động chính */}
      <div className="mt-4">
        {stage !== "COMPLETED" ? (
          <button
            type="button"
            onClick={handleRecord}
            disabled={isRecording || isPlayingAudio || !!resetMessage}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-4 text-sm font-bold text-white shadow-sm transition-all duration-150 active:translate-y-1 active:border-b-0 ${
              isRecording
                ? "border-rose-700 bg-rose-500 animate-pulse"
                : stage === "BONUS"
                ? "border-amber-600 bg-amber-400 text-amber-950 hover:bg-amber-500"
                : "border-emerald-700 bg-emerald-500 hover:bg-emerald-600"
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
            type="button"
            onClick={onComplete}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-4 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
          >
            Hoàn thành Phase 1 ➔
          </button>
        )}
      </div>

    </div>
  );
}