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
        onBackToWorkspace={() => setEvaluation(null)}
        onResetSession={resetSession}
      />
    );
  }

  // Màn hình làm bài (Workspace)
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="z-10 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Quay về trang chủ"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                IELTS Prep Workspace
              </p>
              <h1 className="font-bold">Writing Task 2 Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold sm:flex ${
                secondsLeft < 300
                  ? "bg-red-100 text-red-600 dark:bg-red-950/40"
                  : "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <Clock3 className="h-4 w-4" /> {formatTime(secondsLeft)}
            </div>
            <button
              onClick={() => setTimerRunning((value) => !value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {timerRunning ? "Pause" : "Start timer"}
            </button>
            <button
              onClick={() => void requestEvaluation()}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
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
          <aside className="flex w-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:w-[56%] lg:w-[56%]">
            <WritingTutorChat
              questionText={questionText}
              onQuestionChange={setQuestionText}
              targetBand={targetBand}
              onTargetBandChange={setTargetBand}
            />
            <button
              onClick={() => setLeftVisible(false)}
              className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <PanelLeftClose className="h-4 w-4" /> Ẩn Tutor panel
            </button>
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
          {!leftVisible && (
            <button
              onClick={() => setLeftVisible(true)}
              className="m-3 flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900"
            >
              <PanelLeftOpen className="h-4 w-4" /> Hiện Counselor panel
            </button>
          )}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-indigo-500" /> Your essay
            </div>
            <div className={wordCount >= 250 ? "font-bold text-emerald-600" : "text-slate-500"}>
              {wordCount} / 250 words
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col p-4 lg:p-6">
            <div className="absolute left-6 right-6 top-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <textarea
              value={userEssay}
              onChange={(event) => setUserEssay(event.target.value)}
              placeholder="Start with a clear introduction that paraphrases the question and presents your position..."
              className="mt-2 min-h-0 flex-1 resize-none rounded-2xl border border-slate-200 bg-white p-5 font-sans text-[15px] leading-8 text-slate-800 outline-none ring-indigo-500 transition focus:ring-2 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 placeholder:text-slate-400 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              aria-label="Bài viết của bạn"
            />
          </div>
          <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">
            <span className="flex items-center gap-2">
              <CheckCircle2
                className={`h-4 w-4 ${draftSaved ? "text-emerald-500" : "text-slate-400"}`}
              />
              {draftSaved ? "Draft auto-saved" : "Saving draft..."}
            </span>
            <span className="hidden sm:inline">Aim for 4 paragraphs · 250+ words</span>
          </div>
        </main>
      </div>
    </div>
  );
}