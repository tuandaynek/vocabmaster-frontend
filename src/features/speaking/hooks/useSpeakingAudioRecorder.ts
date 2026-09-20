import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export function useSpeakingAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const accumulatedBlobsRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  // Dùng Ref để tránh stale closure khi resolve Promise ở stopRecordingTurn
  const latestTranscriptRef = useRef("");

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone capture is not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!stream.active) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("The microphone stream is inactive.");
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      recordingStreamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      latestTranscriptRef.current = "";
      setTranscriptText("");
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

    // Khởi tạo Web Speech API cho Speech-to-Text tức thì
    const SpeechRecognition =
      (
        window as Window & {
          SpeechRecognition?: SpeechRecognitionConstructor;
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: SpeechRecognitionConstructor;
        }
      ).webkitSpeechRecognition;

      if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = ""; // Lưu trữ các câu đã nói xong trước đó

      recognition.onresult = (event) => {
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcriptPiece = event.results[i][0].transcript;

          // Nếu cụm từ này đã được nhận diện chính thức (người dùng vừa dừng nghỉ 1 nhịp)
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + " ";
          } else {
            // Cụm từ đang nói dở chưa chốt
            currentInterim += transcriptPiece;
          }
        }

        // Kết hợp cả văn bản đã chốt + văn bản đang nói dở
        const fullText = (finalTranscript + currentInterim).trim();

        latestTranscriptRef.current = fullText;
        setTranscriptText(fullText);
      };

      recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (error) {
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
      mediaRecorderRef.current = null;
      setIsRecording(false);
      console.error("Unable to initialize microphone recorder:", error);
      throw error;
    }
  }, [isRecording]);

  const stopRecordingTurn = useCallback(
    (): Promise<string> =>
      new Promise((resolve) => {
        // Dừng nhận diện giọng nói
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }

        const mediaRecorder = mediaRecorderRef.current;

        if (!mediaRecorder || mediaRecorder.state === "inactive") {
          recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
          recordingStreamRef.current = null;
          setIsRecording(false);
          resolve(latestTranscriptRef.current);
          return;
        }

        mediaRecorder.onstop = () => {
          // 1. Lưu Blob lượt nói này vào mảng gộp tổng session
          const turnBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });

          if (turnBlob.size > 0) {
            accumulatedBlobsRef.current.push(turnBlob);
          }

          // 2. Tắt Mic hardware
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
          recordingStreamRef.current = null;
          mediaRecorderRef.current = null;
          setIsRecording(false);

          // 3. Resolve kết quả transcript mới nhất từ Ref
          resolve(latestTranscriptRef.current);
        };

        mediaRecorder.stop();
      }),
    [],
  );

  useEffect(() => {
    if (!isRecording) return;
    const intervalId = window.setInterval(() => {
      setRecordingTime((previous) => previous + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRecording]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    recognitionRef.current = null;
    recordingStreamRef.current = null;
  }, []);

  // Lấy file audio tổng toàn bộ các lượt đã nói để gửi đi Evaluate (Groq / Gemini)
  const getCombinedAudioSession = useCallback(
    () => new Blob(accumulatedBlobsRef.current, { type: "audio/webm" }),
    [],
  );

  // Reset toàn bộ bộ nhớ tạm khi mở bài tập mới
  const resetAudioSession = useCallback(() => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach((track) => track.stop());

    recognitionRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    accumulatedBlobsRef.current = [];
    latestTranscriptRef.current = "";

    setTranscriptText("");
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  return {
    isRecording,
    recordingTime,
    transcriptText,
    startRecording,
    stopRecordingTurn,
    getCombinedAudioSession,
    resetAudioSession,
  };
}
