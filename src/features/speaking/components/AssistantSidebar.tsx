import { Sparkles, Lightbulb, Send, Check, ChevronRight } from "lucide-react";
import type { AssistantTab, CollocationItem, IdeaHints } from "../types/speaking.types";

interface AssistantSidebarProps {
  activeTab: AssistantTab;
  setActiveTab: (tab: AssistantTab) => void;
  phrase: string;
  setPhrase: (val: string) => void;
  onGetCollocations: () => void;
  hints: IdeaHints | null;
  collocations: CollocationItem[];
  loadingHints?: boolean;
  onEvaluate: () => void;
  isEvaluating?: boolean;
  canEvaluate?: boolean;
}

export function AssistantSidebar({
  activeTab,
  setActiveTab,
  phrase,
  setPhrase,
  onGetCollocations,
  hints,
  collocations,
  loadingHints = false,
  onEvaluate,
  isEvaluating = false,
  canEvaluate = true,
}: AssistantSidebarProps) {
  return (
  <aside className="flex min-h-[680px] flex-col rounded-[32px] border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl">
    <div className="border-b border-slate-800 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">AI Assistant</h2>
          <p className="text-[11px] text-slate-400">Private support — not shown in your answer</p>
        </div>
      </div>

      <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
        <button
          onClick={() => setActiveTab("collocations")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === "collocations"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Collocations
        </button>
        <button
          onClick={() => setActiveTab("hints")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === "hints"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5" /> Idea Hints
        </button>
      </div>
    </div>

    <div className="flex-1 p-5 overflow-y-auto">
      {activeTab === "hints" ? (
        <div className="space-y-5">
          {loadingHints ? (
            <p className="text-xs text-slate-400">Loading idea hints...</p>
          ) : hints ? (
            <>
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Answer structure
                </p>
                <div className="space-y-2">
                  {hints.answerStructure.map((hint, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-slate-200 shadow-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                        {idx + 1}
                      </span>
                      {hint}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Try asking yourself
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  {hints.prompts.map((prompt, idx) => (
                    <p key={idx} className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 leading-relaxed">
                      {prompt}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">No hints available.</p>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-1 text-xs font-bold text-white uppercase tracking-wider">
            Translate your idea into collocations
          </p>
          <p className="mb-4 text-xs leading-5 text-slate-400">
            Enter a Vietnamese phrase for English collocations.
          </p>
          <div className="flex gap-2">
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onGetCollocations()}
              placeholder="e.g. mở rộng kiến thức"
              className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-600"
            />
            <button
              onClick={onGetCollocations}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-white hover:opacity-90 shadow-md shadow-indigo-600/30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-2.5">
            {collocations.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-3 text-xs text-indigo-200 shadow-inner"
              >
                <div className="flex items-center gap-2 font-bold text-white">
                  <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                  {item.phrase}
                </div>
                <p className="mt-1 pl-6 text-xs text-indigo-300/80">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="border-t border-slate-800 p-5">
      <button
        onClick={onEvaluate}
        disabled={isEvaluating || !canEvaluate}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:opacity-90 disabled:opacity-50"
      >
        {isEvaluating ? "Evaluating..." : "Finish & Evaluate Response"}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </aside>
);
}