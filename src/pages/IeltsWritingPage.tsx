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
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-800">
      <header className="z-10 shrink-0 border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/ielts")}
              className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              aria-label="Quay về"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                IELTS Prep Workspace
              </p>
              <h1 className="text-base font-extrabold text-slate-800">Writing Task 2 Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold sm:flex border ${
                secondsLeft < 300
                  ? "border-rose-200 bg-rose-50 text-rose-700 animate-pulse"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <Clock3 className="h-4 w-4" /> {formatTime(secondsLeft)}
            </div>
            <button
              type="button"
              onClick={() => setTimerRunning((value) => !value)}
              className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
            >
              {timerRunning ? "Pause" : "Start timer"}
            </button>
            <button
              type="button"
              onClick={() => void requestEvaluation()}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-60"
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
          <aside className="flex w-full shrink-0 flex-col overflow-hidden border-r-2 border-slate-100 bg-slate-50 p-4 md:w-[56%] lg:w-[56%]">
            <WritingTutorChat
              questionText={questionText}
              onQuestionChange={setQuestionText}
              targetBand={targetBand}
              onTargetBandChange={setTargetBand}
            />
            <button
              type="button"
              onClick={() => setLeftVisible(false)}
              className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
            >
              <PanelLeftClose className="h-4 w-4" /> Ẩn Tutor panel
            </button>
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col bg-slate-50">
          {!leftVisible && (
            <button
              type="button"
              onClick={() => setLeftVisible(true)}
              className="m-3 flex w-fit items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
            >
              <PanelLeftOpen className="h-4 w-4 text-emerald-700" /> Hiện Counselor panel
            </button>
          )}
          <div className="flex items-center justify-between border-b-2 border-slate-100 bg-white px-6 py-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Target className="h-4 w-4 text-emerald-700" /> Your essay
            </div>
            <div className={`text-xs font-bold ${wordCount >= 250 ? "text-emerald-700" : "text-slate-500"}`}>
              {wordCount} / 250 words
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col p-6">
            <div className="absolute left-6 right-6 top-2 h-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <textarea
              value={userEssay}
              onChange={(event) => setUserEssay(event.target.value)}
              placeholder="Start with a clear introduction that paraphrases the question and presents your position..."
              className="mt-3 min-h-0 flex-1 resize-none rounded-3xl border-2 border-slate-100 bg-white p-6 font-sans text-sm leading-8 text-slate-800 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              aria-label="Bài viết của bạn"
            />
          </div>
          <div className="flex shrink-0 items-center justify-between border-t-2 border-slate-100 bg-white px-6 py-3.5 text-xs text-slate-500">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2
                className={`h-4 w-4 ${draftSaved ? "text-emerald-600" : "text-slate-400"}`}
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