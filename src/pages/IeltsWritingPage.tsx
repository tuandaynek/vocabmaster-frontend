import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import WritingTutorChat from "@/features/writing/components/WritingTutorChat";
import { WritingReportView } from "@/features/writing/components/WritingReportView";
import type { Evaluation } from "@/features/writing/types/writing.types";
import { useRating } from "@/contexts/RatingContext";

const DRAFT_KEY = "ielts-writing-task-2-draft";
const TOTAL_SECONDS = 40 * 60;

function readDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return { questionText: "", userEssay: "" };
  try {
    const draft = JSON.parse(saved) as { questionText?: string; userEssay?: string };
    return {
      questionText: draft.questionText || "",
      userEssay: draft.userEssay || "",
    };
  } catch (error) {
    console.warn("Unable to restore writing draft:", error);
    return { questionText: "", userEssay: "" };
  }
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function IeltsWritingPage() {
  const navigate = useNavigate();
  const { openRating } = useRating();
  const [initialDraft] = useState(readDraft);
  const [questionText, setQuestionText] = useState(initialDraft.questionText);
  const [userEssay, setUserEssay] = useState(initialDraft.userEssay);
  const [targetBand, setTargetBand] = useState("6.5");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState<"evaluate" | null>(null);
  const [leftVisible, setLeftVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const wordCount = useMemo(
    () => userEssay.trim().split(/\s+/).filter(Boolean).length,
    [userEssay],
  );
  const progress = Math.min((wordCount / 250) * 100, 100);

  // Auto-save draft
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ questionText, userEssay }));
      setDraftSaved(true);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [questionText, userEssay]);

  // Timer interval
  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const requestEvaluation = async () => {
    if (!questionText.trim() || !userEssay.trim()) {
      toast.error("Hãy nhập cả đề bài và bài viết.");
      return;
    }
    setLoading("evaluate");
    try {
      const response = (await axiosClient.post(ENDPOINTS.WRITING.EVALUATE, {
        questionText,
        userEssay,
        targetBand: parseFloat(targetBand),
      })) as { data: Evaluation };
      console.log("Writing evaluation response:", response.data);
      setEvaluation(response.data);
      setTimerRunning(false);
      toast.success("Báo cáo chấm bài đã sẵn sàng.");
    } catch (error) {
      console.error("Writing evaluation failed:", error);
      toast.error("Không thể kết nối Writing Tutor lúc này.");
    } finally {
      setLoading(null);
    }
  };

  const resetSession = () => {
    setEvaluation(null);
    setQuestionText("");
    setUserEssay("");
    setSecondsLeft(TOTAL_SECONDS);
    setTimerRunning(false);
    localStorage.removeItem(DRAFT_KEY);
  };

  // Màn hình kết quả (Report)
  if (evaluation) {
    return (
      <WritingReportView
        evaluation={evaluation}
        targetBand={targetBand}
        onBackToWorkspace={() => {
          // Bật rating trước khi cho về workspace
          openRating({
            feature: "IELTS Writing Evaluator",
            title: "Đánh giá chất lượng chấm bài Writing",
            description: "Bạn thấy kết quả phân tích bài viết lần này thế nào?",
            fastComments: [
              "Nhận xét chi tiết, chính xác",
              "Band điểm đánh giá khách quan",
              "Gợi ý từ vựng, paraphrase tốt",
              "Cần cải thiện độ sâu của phân tích",
            ],
            onClose: () => setEvaluation(null) // Đóng rating xong mới thực sự chuyển trang
          });
        }}
        onResetSession={resetSession}
      />
    );
  }

  // Màn hình làm bài (Workspace)
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="z-10 shrink-0 border-b border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ielts")}
              className="rounded-2xl p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white border border-slate-800"
              aria-label="Quay về"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                IELTS Prep Workspace
              </p>
              <h1 className="font-black text-white text-base">Writing Task 2 Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold sm:flex border ${
                secondsLeft < 300
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              <Clock3 className="h-4 w-4" /> {formatTime(secondsLeft)}
            </div>
            <button
              onClick={() => setTimerRunning((value) => !value)}
              className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {timerRunning ? "Pause" : "Start timer"}
            </button>
            <button
              onClick={() => void requestEvaluation()}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-90 disabled:opacity-60 transition"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Nộp bài & Chấm điểm</span>
              <span className="sm:hidden">Nộp bài</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {leftVisible && (
          <aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900/60 p-4 md:w-[56%] lg:w-[56%] backdrop-blur-xl">
            <WritingTutorChat
              questionText={questionText}
              onQuestionChange={setQuestionText}
              targetBand={targetBand}
              onTargetBandChange={setTargetBand}
            />
            <button
              onClick={() => setLeftVisible(false)}
              className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <PanelLeftClose className="h-4 w-4" /> Ẩn Tutor panel
            </button>
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col bg-slate-950">
          {!leftVisible && (
            <button
              onClick={() => setLeftVisible(true)}
              className="m-3 flex w-fit items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-md"
            >
              <PanelLeftOpen className="h-4 w-4 text-indigo-400" /> Hiện Counselor panel
            </button>
          )}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3.5 bg-slate-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Target className="h-4 w-4 text-indigo-400" /> Your essay
            </div>
            <div className={`text-xs font-bold ${wordCount >= 250 ? "text-emerald-400" : "text-slate-400"}`}>
              {wordCount} / 250 words
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col p-6">
            <div className="absolute left-6 right-6 top-2 h-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <textarea
              value={userEssay}
              onChange={(event) => setUserEssay(event.target.value)}
              placeholder="Start with a clear introduction that paraphrases the question and presents your position..."
              className="mt-3 min-h-0 flex-1 resize-none rounded-[32px] border border-slate-800 bg-slate-900/60 p-6 font-sans text-sm leading-8 text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition placeholder:text-slate-600 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl backdrop-blur-xl"
              aria-label="Bài viết của bạn"
            />
          </div>
          <div className="flex shrink-0 items-center justify-between border-t border-slate-800 px-6 py-3.5 text-xs text-slate-400 bg-slate-900/40">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2
                className={`h-4 w-4 ${draftSaved ? "text-emerald-400" : "text-slate-600"}`}
              />
              {draftSaved ? "Draft auto-saved" : "Saving draft..."}
            </span>
            <span className="hidden sm:inline font-medium">Aim for 4 paragraphs · 250+ words</span>
          </div>
        </main>
      </div>
    </div>
  );
}