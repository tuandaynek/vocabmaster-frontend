import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Square, Send, User, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  AssistantTab,
  CollocationItem,
  Question,
  EvaluationResponse,
  IdeaHints,
  SpeechRecognitionConstructorLike,
  SpeechRecognitionInstanceLike,
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

  const [isRecording, setIsRecording] = useState(false);
  const [sessionAudioBlobs, setSessionAudioBlobs] = useState<Blob[]>([]);
  const [hints, setHints] = useState<IdeaHints | null>(null);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  const [hintsRequestVersion, setHintsRequestVersion] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessingStep]);

  useEffect(() => {
    if (activeTab !== "hints" || hints || hintsRequestVersion === 0) return;

    let isCurrentRequest = true;
    const loadHints = async () => {
      try {
        const result = await speakingApi.getIdeaHints({
          question: question.text,
          history: messages.map(({ sender, text }) => ({
            role: sender,
            content: text,
          })),
        });
        if (isCurrentRequest) setHints(result);
      } catch {
        if (isCurrentRequest) {
          toast.error("Unable to load idea hints. Please try again.");
        }
      } finally {
        if (isCurrentRequest) setIsLoadingHints(false);
      }
    };
    void loadHints();

    return () => {
      isCurrentRequest = false;
    };
  }, [activeTab, hints, hintsRequestVersion, messages, question.text]);

  useEffect(
    () => () => {
      isManuallyStoppedRef.current = true;
      recognitionRef.current?.stop();
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
      }
      mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const [collocations, setCollocations] = useState<CollocationItem[]>([]);

  const handleAssistantTabChange = (tab: AssistantTab) => {
    setActiveTab(tab);
    if (tab === "hints" && !hints) {
      setIsLoadingHints(true);
      setHintsRequestVersion((version) => version + 1);
    }
  };

  const handleGetCollocations = async () => {
    if (!phrase.trim()) return;
    try {
      const result = await speakingApi.getCollocations({
        vietnamesePhrase: phrase.trim(),
        currentQuestion: question.text,
        targetBand,
      });
      if (result.length > 0) {
        setCollocations((previous) => [...previous, ...result]);
      }
      setPhrase("");
    } catch {
      toast.error("Unable to load collocations. Please try again.");
    }
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

      const followUpQuestion = res.followUpQuestion;
      if (res.needsFollowUp && followUpQuestion) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "examiner",
            text: followUpQuestion,
          },
        ]);
      }
      setTextInput("");
      setIsProcessingStep(false);
    } catch {
      toast.error("Unable to get a response from the speaking examiner.");
    } finally {
      setIsProcessingStep(false);
    }
  };

  // ==========================================
  // HANDLE RECORDING
  // ==========================================
  const startRecording = async () => {
    let stream: MediaStream | null = null;
    try {
      // Reset toàn bộ state & ref trước khi ghi âm mới
      accumulatedTranscriptRef.current = "";
      isManuallyStoppedRef.current = false;
      setTextInput("");

      const activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream = activeStream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(activeStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        activeStream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        recognitionRef.current = null;

        // Lấy toàn bộ văn bản đã cộng dồn tích lũy
        const finalTranscript = accumulatedTranscriptRef.current.trim();
        await handleAudioRecorded(audioBlob, finalTranscript);
      };

      // --- CẤU HÌNH WEB SPEECH API ---
      const speechWindow = window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructorLike;
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
      };
      const SpeechRecognition =
        speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
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
          setTextInput(fullLiveText);
        };

        // TỰ ĐỘNG RESTART NẾU CHƯA BẤM DỪNG THỦ CÔNG
        // Trình duyệt thường tự ngắt SpeechRecognition khi im lặng quá 3-5 giây
        recognition.onend = () => {
          if (!isManuallyStoppedRef.current) {
            try {
              recognition.start();
            } catch {
              recognitionRef.current = null;
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
      mediaRecorderRef.current = null;
      recognitionRef.current = null;
      setIsRecording(false);
      toast.error("Unable to access the microphone. Check your browser permissions.");
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

  const handleAudioRecorded = (audioBlob: Blob, finalTranscript: string) => {
    // Đưa file Audio vừa thu vào mảng session audio blobs
    setSessionAudioBlobs((prev) => [...prev, audioBlob]);

    if (finalTranscript.trim()) {
      // Gửi tin nhắn chứa toàn bộ văn bản đã nói
      handleSendMessage(finalTranscript.trim());

      // Reset lại toàn bộ bộ nhớ tạm
      setTextInput("");
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
    } catch {
      toast.error("Unable to evaluate this speaking session. Please try again.");
    } finally {
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
                  disabled={isProcessingStep}
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
                    disabled={isRecording}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage(textInput)}
                    aria-label="Send answer"
                    disabled={
                      !textInput.trim() ||
                      isProcessingStep ||
                      isRecording
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
            setActiveTab={handleAssistantTabChange}
            phrase={phrase}
            setPhrase={setPhrase}
            onGetCollocations={handleGetCollocations}
            hints={hints}
            collocations={collocations}
            loadingHints={isLoadingHints}
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
