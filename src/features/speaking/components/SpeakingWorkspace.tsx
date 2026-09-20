import { useState } from "react";
import { ArrowLeft, Mic, Square } from "lucide-react";
import type { AssistantTab, Question, EvaluationResponse } from "../types/speaking.types";
import { AssistantSidebar } from "./AssistantSidebar";
import { EvaluationModal } from "./EvaluationModal";

interface SpeakingWorkspaceProps {
  question: Question;
  targetBand: string;
  onBack: () => void;
}

// Mock data giả lập kết quả trả về từ API
const MOCK_EVALUATION_DATA: EvaluationResponse = {
  userAudioUrl: undefined,
  transcript: "I am working as a software developer for two years...",
  bandScores: {
    overall: 6.5,
    fluencyCoherence: 6.5,
    lexicalResource: 7.0,
    grammarAccuracy: 6.0,
    pronunciation: 6.5,
  },
  coherenceFeedback: {
    statusTag: "Good Flow",
    analysis: "Your answer is well-structured with clear transition words.",
    actionableTip: "Try to expand your second point with a specific example.",
  },
  strategyFeedback: {
    examinerPerspective: "The response directly answers the prompt but lacks depth in the explanation.",
    actionableAdvice: "Use the 'PPF (Past-Present-Future)' framework to extend your answer.",
  },
  grammarCorrections: [
    {
      original: "I am working as a software developer for two years",
      corrected: "I have been working as a software developer for two years",
      explanation: "Dùng Present Perfect Continuous cho hành động bắt đầu ở quá khứ và vẫn đang tiếp diễn.",
    },
  ],
  lexicalUpgrades: [
    {
      original: "good job",
      upgrade: "rewarding career",
      meaning: "Công việc mang lại nhiều giá trị / sự thỏa mãn",
      example: "Software engineering is a demanding yet highly rewarding career.",
    },
  ],
  pronunciationFeedback: [
    {
      word: "developer",
      ipa: "/dɪˈvel.ə.pər/",
      issue: "Nhấn sai trọng âm ở âm tiết đầu",
      tip: "Nhấn trọng âm vào âm tiết thứ 2 'VEL'.",
      severity: "MINOR",
    },
  ],
  fluencyFeedback: {
    pacingAndPauses: "Nhịp độ nói tự nhiên, có 1-2 khoảng dừng hơi dài khi tìm từ vựng.",
    chunkingTip: "Hãy ngắt cụm ý theo clause thay vì dừng đột ngột giữa chủ ngữ và động từ.",
  },
  sampleAnswer: "I have been working as a full-stack software engineer for the past two years. What I find most exhilarating about my profession is the opportunity to solve complex logical problems daily...",
};

export function SpeakingWorkspace({ question, targetBand, onBack }: SpeakingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AssistantTab>("hints");
  const [phrase, setPhrase] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  
  // State lưu kết quả evaluation
  const [evalData, setEvalData] = useState<EvaluationResponse | null>(null);

  const mockHints = {
    answerStructure: ["State your main opinion directly.", "Provide 1-2 examples from experience.", "Conclude briefly."],
    prompts: ["Why is this topic important to you?", "How has this changed recently?"],
  };

  const [collocations, setCollocations] = useState([
    { phrase: "broaden one's horizons", meaning: "mở rộng tầm mắt/kiến thức" }
  ]);

  const handleGetCollocations = () => {
    if (!phrase.trim()) return;
    setCollocations((prev) => [
      ...prev,
      { phrase: `Collocation for "${phrase}"`, meaning: "Bản dịch nghĩa" }
    ]);
    setPhrase("");
  };

  const handleEvaluate = () => {
    setIsEvaluating(true);
    // Giả lập call API thành công và gán data
    setTimeout(() => {
      setEvalData(MOCK_EVALUATION_DATA);
      setIsEvaluating(false);
      setIsEvalModalOpen(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to library
          </button>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            Target Band: {targetBand}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
          {/* Audio Practice Area */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Current Question
              </span>
              <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                {question.text}
              </h1>
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex h-20 w-20 items-center justify-center rounded-full transition ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              <p className="mt-4 text-sm font-medium text-slate-600">
                {isRecording ? "Listening... Click to pause" : "Click mic to start speaking"}
              </p>
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

      {/* Truyền ĐẦY ĐỦ 4 PROPS cho EvaluationModal */}
      <EvaluationModal
        isOpen={isEvalModalOpen}
        data={evalData}
        question={question.text}
        onClose={() => setIsEvalModalOpen(false)}
      />
    </div>
  );
}