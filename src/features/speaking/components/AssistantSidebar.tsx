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
  <aside className="flex min-h-[680px] flex-col rounded-3xl border-2 border-slate-100 bg-white shadow-sm">
    <div className="border-b-2 border-slate-100 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">AI Assistant</h2>
          <p className="text-[11px] text-slate-500">Private support — not shown in your answer</p>
        </div>
      </div>

      <div className="flex rounded-2xl border-2 border-slate-100 bg-slate-50 p-1">
        <button
          onClick={() => setActiveTab("collocations")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === "collocations"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-white hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Collocations
        </button>
        <button
          onClick={() => setActiveTab("hints")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
            activeTab === "hints"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-white hover:text-slate-800"
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
            <p className="text-xs text-slate-500">Loading idea hints...</p>
          ) : hints ? (
            <>
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Answer structure
                </p>
                <div className="space-y-2">
                  {hints.answerStructure.map((hint, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-700 shadow-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                        {idx + 1}
                      </span>
                      {hint}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Try asking yourself
                </p>
                <div className="space-y-2 text-xs text-slate-600">
                  {hints.prompts.map((prompt, idx) => (
                    <p key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 leading-relaxed">
                      {prompt}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">No hints available.</p>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-800">
            Translate your idea into collocations
          </p>
          <p className="mb-4 text-xs leading-5 text-slate-500">
            Enter a Vietnamese phrase for English collocations.
          </p>
          <div className="flex gap-2">
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onGetCollocations()}
              placeholder="e.g. mở rộng kiến thức"
              className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={onGetCollocations}
              aria-label="Get collocations"
              className="rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-3.5 text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-2.5">
            {collocations.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs text-emerald-800"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item.phrase}
                </div>
                <p className="mt-1 pl-6 text-xs text-emerald-700">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="border-t-2 border-slate-100 p-5">
      <button
        type="button"
        onClick={onEvaluate}
        disabled={isEvaluating || !canEvaluate}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isEvaluating ? "Evaluating..." : "Finish & Evaluate Response"}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </aside>
);
}