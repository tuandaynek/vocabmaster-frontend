import { useState, useRef } from "react";
import { normalizeSpeechText } from "../utils/speechUtils";
import { getCleanWords } from "../utils/collocationUtils";

interface UseSpeechPracticeProps {
  targetSentence: string;
  onComplete?: (score: number, transcript: string) => void;
}

export function useSpeechPractice({ targetSentence, onComplete }: UseSpeechPracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef("");
  const isManualStopRef = useRef(false);

  // Đánh giá điểm số
  const evaluateSpeech = (transcript: string) => {
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
    if (onComplete) onComplete(calculatedScore, transcript);
  };

  // Bắt đầu thu âm
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói!");
      return;
    }

    if (!targetSentence) return;

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
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 4000);
    };

    recognition.onstart = () => {
      setIsRecording(true);
      resetSilenceTimer();
    };

    recognition.onresult = (e: any) => {
      let currentTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        currentTranscript += e.results[i][0].transcript + " ";
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

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (!isManualStopRef.current) {
        try {
          recognition.start();
          return;
        } catch (err) {}
      }

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      setIsRecording(false);
      evaluateSpeech(latestTranscriptRef.current);
    };

    recognition.start();
  };

  const stopRecording = () => {
    isManualStopRef.current = true;
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const resetSpeech = () => {
    setSpokenText(null);
    setScore(null);
    latestTranscriptRef.current = "";
  };

  return {
    isRecording,
    spokenText,
    score,
    startRecording,
    stopRecording,
    setScore,
    resetSpeech, // 👈 Export thêm resetSpeech
  };
}