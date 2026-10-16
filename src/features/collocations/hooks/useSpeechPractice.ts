import { useCallback, useEffect, useRef, useState } from "react";
import { getCleanWords } from "../utils/collocationUtils";
import { getSpeechRecognitionConstructor } from "../utils/speechRecognition";
import type { SpeechRecognitionLike } from "../types/speechRecognition";

interface UseSpeechPracticeProps {
  targetSentence: string;
  onComplete?: (score: number, transcript: string) => void;
}

export function useSpeechPractice({ targetSentence, onComplete }: UseSpeechPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTranscriptRef = useRef("");
  const isManualStopRef = useRef(false);

  // Đánh giá điểm số
  const evaluateSpeech = useCallback((transcript: string) => {
    setSpokenText(transcript);

    if (!targetSentence) return;

    const targetWords = getCleanWords(targetSentence);
    const spokenWords = getCleanWords(transcript);

    if (targetWords.length === 0) {
      setScore(0);
      return;
    }

    let correctCount = 0;
    const spokenPool = [...spokenWords];

    targetWords.forEach((targetWord) => {
      const matchIndex = spokenPool.indexOf(targetWord);
      if (matchIndex !== -1) {
        correctCount++;
        spokenPool.splice(matchIndex, 1);
      }
    });

    const calculatedScore = Math.min(
      100,
      Math.round((correctCount / targetWords.length) * 100)
    );

    setScore(calculatedScore);
    onComplete?.(calculatedScore, transcript);
  }, [onComplete, targetSentence]);

  // Bắt đầu thu âm
  const startRecording = () => {
    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setSpeechError("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }

    if (!targetSentence) return;

    setSpeechError(null);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;
    latestTranscriptRef.current = "";
    isManualStopRef.current = false;

    // Lấy 5 từ cuối câu
    const baseWords = getCleanWords(targetSentence);
    const lastNCount = Math.min(5, baseWords.length);
    const lastWordsPattern = baseWords.slice(-lastNCount).join(" ");

    const resetSilenceTimer = () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        isManualStopRef.current = true;
        recognitionRef.current?.stop();
      }, 4000);
    };

    recognition.onstart = () => {
      setIsRecording(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += `${event.results[i][0].transcript} `;
      }

      const cleanCurrent = getCleanWords(currentTranscript).join(" ");
      latestTranscriptRef.current = currentTranscript.trim();

      if (lastWordsPattern && cleanCurrent.includes(lastWordsPattern)) {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        isManualStopRef.current = true;
        recognition.stop();
        return;
      }

      resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      isManualStopRef.current = true;
      setIsRecording(false);
      setSpeechError(
        event.error === "not-allowed"
          ? "Vui lòng cấp quyền sử dụng micro để luyện nói."
          : "Không thể nhận diện giọng nói. Vui lòng thử lại.",
      );
    };

    recognition.onend = () => {
      if (!isManualStopRef.current) {
        try {
          try {
            recognition.start();
          } catch {
            isManualStopRef.current = true;
            setIsRecording(false);
            setSpeechError("Không thể khởi động micro. Vui lòng thử lại.");
          }
          return;
        } catch {
          isManualStopRef.current = true;
        }
      }

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
      evaluateSpeech(latestTranscriptRef.current);
    };

    recognition.start();
  };

  const stopRecording = () => {
    isManualStopRef.current = true;
    recognitionRef.current?.stop();
  };

  const resetSpeech = useCallback(() => {
    setSpokenText("");
    setScore(null);
    setSpeechError(null);
    latestTranscriptRef.current = "";
  }, []);

  useEffect(() => () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
  }, []);

  return {
    isRecording,
    spokenText,
    score,
    speechError,
    startRecording,
    stopRecording,
    setScore,
    resetSpeech, // 👈 Export thêm resetSpeech
  };
}