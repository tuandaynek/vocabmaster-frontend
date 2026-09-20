import { useState, useEffect, useRef } from "react";
import type { CollocationReviewData } from "../types";

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

  // Tính điểm & Đánh giá
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

    // Xử lý luồng chuyển Phase / Reset Loop
    if (stage === "BONUS") {
      if (finalScore === 100) {
        setStage("COMPLETED");
      } else {
        // Thu âm lần 4 (BONUS) vẫn không được 100% -> Reset về từ đầu
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
      // Đã xong 3 lượt -> Kiểm tra điều kiện
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

  // Render Cụm từ và Badges Lỗi ngay bên dưới từ bị sai
  const renderInteractivePhrase = () => {
    const targetWords = collocation.phrase.trim().split(/\s+/);
    const activeAttemptData = attempts.find((a) => a.attemptIndex === selectedAttemptIndex);

    if (!activeAttemptData) {
      return (
        <h2 className="text-3xl font-extrabold text-gray-900 mt-4 tracking-tight">
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
      <div className="flex flex-wrap justify-center items-start gap-3 mt-4 min-h-[90px]">
        {targetWords.map((word, idx) => {
          const cleanTarget = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
          const spokenAtIdx = spokenWords[idx];

          let isCorrect = spokenAtIdx === cleanTarget;
          let isMissing = !spokenAtIdx;

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Word Card */}
              <span
                className={`text-3xl font-extrabold px-3 py-1 rounded-xl border transition-all ${
                  isCorrect
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}
              >
                {word}
              </span>

              {/* Badge từ sai/thiếu ngay phía dưới */}
              {!isCorrect && (
                <span className="mt-1.5 px-2 py-0.5 text-[11px] font-bold tracking-wide rounded-md bg-red-500 text-white shadow-sm animate-bounce">
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border text-center">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
          PHASE 1: DEEP CHUNK SHADOWING
        </span>
        <span className="text-xs font-bold text-gray-500">
          Lượt xem:{" "}
          <span className="text-blue-600 font-extrabold">
            {selectedAttemptIndex}/{stage === "BONUS" ? 4 : 3}
          </span>
        </span>
      </div>

      {renderInteractivePhrase()}
      <p className="text-gray-500 italic mt-1">{collocation.meaning}</p>

      {/* Điểm số */}
      <div className="flex justify-around my-4">
        <div className="p-3 bg-gray-50 rounded-xl w-36 border">
          <p className="text-xs text-gray-400 font-medium">LẦN 1</p>
          <p className="text-2xl font-bold text-gray-700">
            {firstScore !== null ? `${firstScore}%` : "--"}
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-xl w-36 border border-green-200">
          <p className="text-xs text-green-600 font-medium">LẦN MỚI NHẤT</p>
          <p className="text-2xl font-bold text-green-600">
            {lastScore !== null ? `${lastScore}%` : "--"}
          </p>
        </div>
      </div>

      {/* Nút bấm chuyển lượt */}
      <div className="flex justify-center gap-2 mb-4">
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
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isSelected ? "ring-2 ring-offset-2 ring-blue-600 scale-105" : ""
              } ${
                attemptData
                  ? attemptData.score === 100
                    ? "bg-emerald-500 text-white cursor-pointer hover:opacity-90"
                    : "bg-amber-500 text-white cursor-pointer hover:opacity-90"
                  : isCurrentAction
                  ? "border-2 border-blue-600 text-blue-600 animate-pulse"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {step === 4 ? "⭐" : attemptData ? `${attemptData.score}%` : step}
            </button>
          );
        })}
      </div>

      {/* Thông báo trạng thái */}
      <div className="min-h-[48px] flex flex-col items-center justify-center text-sm">
        {resetMessage && (
          <p className="text-red-600 font-bold animate-pulse">{resetMessage}</p>
        )}

        {!resetMessage && isPlayingAudio && (
          <p className="text-blue-600 font-semibold animate-pulse">
            🔊 Đang phát audio mẫu... Hãy nhại lại theo nhịp!
          </p>
        )}

        {!resetMessage && !isPlayingAudio && stage === "BONUS" && !isRecording && (
          <p className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
            ⚠️ Lượt Thu Âm Quyết Định! Bạn cần đạt 100% để vượt qua.
          </p>
        )}

        {stage === "COMPLETED" && (
          <div className="bg-green-100 text-green-800 p-3 rounded-xl text-sm font-semibold w-full">
            🎉 Hoàn thành xuất sắc Phase 1!
          </div>
        )}
      </div>

      {/* Nút hành động */}
      <div className="mt-4">
        {stage !== "COMPLETED" ? (
          <button
            onClick={handleRecord}
            disabled={isRecording || isPlayingAudio || !!resetMessage}
            className={`w-full py-3.5 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2 ${
              isRecording
                ? "bg-red-500 animate-pulse"
                : stage === "BONUS"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isRecording
              ? "🎙️ Đang lắng nghe..."
              : stage === "BONUS"
              ? "🎙️ Thu Âm Quyết Định (Cần 100%)"
              : `🎙️ Thu âm Lượt ${currentAttempt}/3`}
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition shadow-md"
          >
            Hoàn thành Phase 1 ➔
          </button>
        )}
      </div>
    </div>
  );
}