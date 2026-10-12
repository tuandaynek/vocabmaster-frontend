import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Square, Send, User, Bot, Loader2 } from "lucide-react";
import type {
  AssistantTab,
  Question,
  EvaluationResponse,
} from "../types/speaking.types";
import { AssistantSidebar } from "./AssistantSidebar";
import { EvaluationModal } from "./EvaluationModal";
import { speakingApi } from "../api/speakingApi";

interface SpeakingWorkspaceProps {
  question: Question;
  targetBand: string;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: "examiner" | "candidate";
  text: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function SpeakingWorkspace({
  question,
  targetBand,
  onBack,
}: SpeakingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AssistantTab>("collocations"); // hints / collocations
  const [phrase, setPhrase] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);

  // State quản lý ghi âm và Speech-to-Text
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // Trạng thái đang Speech-to-Text
  const [sessionAudioBlobs, setSessionAudioBlobs] = useState<Blob[]>([]);

  const transcriptRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  // Ref để lưu trữ toàn bộ transcript tích lũy trong suốt session, dùng cho evaluation
  const accumulatedTranscriptRef = useRef<string>("");
  const isManuallyStoppedRef = useRef<boolean>(false);

  // State quản lý lịch sử trò chuyện
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "examiner",
      text: question.text,
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessingStep]);

  // Mock data tạm cho AssistantSidebar
  const mockHints = {
    answerStructure: [
      "State your main opinion directly.",
      "Provide 1-2 examples from experience.",
      "Conclude briefly.",
    ],
    prompts: [
      "Why is this topic important to you?",
      "How has this changed recently?",
    ],
  };

  const [collocations, setCollocations] = useState([
    { phrase: "broaden one's horizons", meaning: "mở rộng tầm mắt/kiến thức" },
  ]);

  const handleGetCollocations = async () => {
    if (!phrase.trim()) return;
    const res = await speakingApi.getCollocations({
      vietnamesePhrase: phrase.trim(),
      currentQuestion: question.text,
      targetBand,
    });
    if (res && res.length > 0) {
      setCollocations((prev) => [...prev, ...res]);
    }
    setPhrase("");
  };

  // ==========================================
  // XỬ LÝ CONVERSATION STEP (Xài hàm processChatStep)
  // ==========================================
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessingStep) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "candidate",
      text,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setTextInput("");
    setIsProcessingStep(true);

    try {
      // Chuyển messages thành history để gửi xuống backend
      const historyPayload = updatedMessages.map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const res = await speakingApi.chatStep({
        question: question.text,
        targetBand,
        history: historyPayload,
        userResponse: text,
      });

      if (res.needsFollowUp && res.followUpQuestion) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "examiner",
            text: res.followUpQuestion,
          },
        ]);
      }
      setTextInput("");
      setIsProcessingStep(false);
    } catch (error) {
      console.error("Error processing chat step:", error);
      setIsProcessingStep(false);
    }
  };

  // ==========================================
  // HANDLE RECORDING
  // ==========================================
  const startRecording = async () => {
    try {
      // Reset toàn bộ state & ref trước khi ghi âm mới
      transcriptRef.current = "";
      accumulatedTranscriptRef.current = "";
      isManuallyStoppedRef.current = false;
      setTextInput("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());

        // Lấy toàn bộ văn bản đã cộng dồn tích lũy
        const finalTranscript = accumulatedTranscriptRef.current.trim();
        await handleAudioRecorded(audioBlob, finalTranscript);
      };

      // --- CẤU HÌNH WEB SPEECH API ---
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalSegment = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalSegment += transcriptPiece + " ";
            } else {
              interimTranscript += transcriptPiece;
            }
          }

          // Nếu có đoạn nói đã hoàn thành (isFinal), cộng dồn vào accumulatedTranscriptRef
          if (finalSegment) {
            accumulatedTranscriptRef.current += finalSegment;
          }

          // Cập nhật text hiển thị realtime = Đã chốt + Đang nói dở
          const fullLiveText = (
            accumulatedTranscriptRef.current + interimTranscript
          ).trim();
          transcriptRef.current = fullLiveText;
          setTextInput(fullLiveText);
        };

        // TỰ ĐỘNG RESTART NẾU CHƯA BẤM DỪNG THỦ CÔNG
        // Trình duyệt thường tự ngắt SpeechRecognition khi im lặng quá 3-5 giây
        recognition.onend = () => {
          if (!isManuallyStoppedRef.current && isRecording) {
            try {
              recognition.start(); // Khởi động lại ngay lập tức
            } catch (e) {
              console.log("Re-starting speech recognition...");
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mic error:", error);
    }
  };

  const stopRecording = () => {
    // Đánh dấu là user CHỦ ĐỘNG bấm dừng
    isManuallyStoppedRef.current = true;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsRecording(false);
  };

  const handleAudioRecorded = async (
    audioBlob: Blob,
    finalTranscript: string,
  ) => {
    // Đưa file Audio vừa thu vào mảng session audio blobs
    setSessionAudioBlobs((prev) => [...prev, audioBlob]);

    if (finalTranscript.trim()) {
      // Gửi tin nhắn chứa toàn bộ văn bản đã nói
      handleSendMessage(finalTranscript.trim());

      // Reset lại toàn bộ bộ nhớ tạm
      setTextInput("");
      transcriptRef.current = "";
      accumulatedTranscriptRef.current = "";
    }
  };

  // Toggle nút Recording
  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ==========================================
  // XỬ LÝ EVALUATION TỔNG (TEXT & AUDIO)
  // ==========================================
  const handleEvaluate = async () => {
    // Tránh gửi nhầm nếu cả audio và tin nhắn đều trống
    if (messages.length === 0 && sessionAudioBlobs.length === 0) {
      alert("Bạn chưa có câu trả lời nào để chấm điểm!");
      return;
    }

    setIsEvaluating(true);

    try {
      let finalAudioBlob: Blob | undefined = undefined;

      // 1. Kiểm tra và merge mảng Audio nếu có
      if (sessionAudioBlobs.length > 0) {
        finalAudioBlob = new Blob(sessionAudioBlobs, { type: "audio/webm" });
      }

      const fullTranscript = messages
        .filter((msg) => msg.sender === "candidate") // Chỉ lấy tin nhắn của candidate
        .map((msg) => msg.text) // Lấy nội dung text
        .join(" "); // Nối các chuỗi lại, cách nhau bằng khoảng trắng

      // 2. Gọi chung 1 hàm API duy nhất
      const res = await speakingApi.evaluate({
        question: question.text,
        targetBand,
        fullTranscript,
        audioBlob: finalAudioBlob,
      });

      // 3. Xử lý UI sau khi có kết quả
      setEvalData(res);
      setIsEvaluating(false);
      setIsEvalModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi chấm điểm session:", error);
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to library
          </button>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm">
            Target Band: {targetBand}
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
          {/* Conversation Area */}
          <div className="flex flex-col space-y-4">
            {/* Question Banner */}
            <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                CURRENT QUESTION
              </span>
              <h1 className="mt-2 text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
                {question.text}
              </h1>
            </div>

            {/* Conversation Box */}
            <div className="flex h-[450px] flex-col rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${
                      msg.sender === "candidate"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${
                        msg.sender === "candidate"
                          ? "border-emerald-700 bg-emerald-500 text-white shadow-sm"
                          : "border-sky-200 bg-sky-50 text-sky-700"
                      }`}
                    >
                      {msg.sender === "candidate" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === "candidate"
                          ? "rounded-tr-none bg-emerald-500 text-white shadow-sm"
                          : "rounded-tl-none border border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Trạng thái đang chuyển giọng nói thành text */}
                {isTranscribing && (
                  <div className="flex items-center gap-2 text-xs italic text-sky-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Converting audio to text...
                  </div>
                )}

                {/* Trạng thái Examiner đang phản hồi */}
                {isProcessingStep && (
                  <div className="flex items-center gap-2 text-xs italic text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Examiner is typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="mt-4 flex items-center gap-3 border-t-2 border-slate-100 pt-4">
                {/* Nút Mic / Stop Recording */}
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  disabled={isTranscribing || isProcessingStep}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-b-4 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isRecording
                      ? "border-rose-700 bg-rose-500 text-white animate-pulse shadow-sm active:translate-y-1 active:border-b-0"
                      : "border-2 border-b-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? (
                    <Square className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSendMessage(textInput)
                    }
                    placeholder={
                      isRecording
                        ? "Listening... Click red button to stop"
                        : "Type your answer here..."
                    }
                    disabled={isRecording || isTranscribing}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage(textInput)}
                    aria-label="Send answer"
                    disabled={
                      !textInput.trim() ||
                      isProcessingStep ||
                      isRecording ||
                      isTranscribing
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-emerald-700 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          <AssistantSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            phrase={phrase}
            setPhrase={setPhrase}
            onGetCollocations={handleGetCollocations}
            hints={mockHints}
            collocations={collocations}
            onEvaluate={handleEvaluate}
            isEvaluating={isEvaluating}
          />
        </div>
      </main>

      <EvaluationModal
        isOpen={isEvalModalOpen}
        data={evalData}
        question={question.text}
        onClose={() => setIsEvalModalOpen(false)}
      />
    </div>
  );
}
