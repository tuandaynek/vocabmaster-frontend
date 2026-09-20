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
    <aside className="flex min-h-[680px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">AI Assistant</h2>
            <p className="text-xs text-slate-500">Private support — not shown in your answer</p>
          </div>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("hints")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === "hints"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" /> Idea Hints
          </button>
          <button
            onClick={() => setActiveTab("collocations")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              activeTab === "collocations"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> VN-to-Collocations
          </button>
        </div>
      </div>

      <div className="flex-1 p-5">
        {activeTab === "hints" ? (
          <div className="space-y-5">
            {loadingHints ? (
              <p className="text-sm text-slate-400">Loading idea hints...</p>
            ) : hints ? (
              <>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Answer structure
                  </p>
                  <div className="space-y-2">
                    {hints.answerStructure.map((hint, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm text-slate-700"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                          {idx + 1}
                        </span>
                        {hint}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Try asking yourself
                  </p>
                  <div className="space-y-2 text-sm text-slate-600">
                    {hints.prompts.map((prompt, idx) => (
                      <p key={idx} className="rounded-xl bg-slate-50 px-4 py-3">
                        {prompt}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No hints available.</p>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-1 text-sm font-bold text-slate-800">
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
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={onGetCollocations}
                className="rounded-xl bg-indigo-600 px-3 text-white hover:bg-indigo-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {collocations.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-3 text-sm text-indigo-800"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                    {item.phrase}
                  </div>
                  <p className="mt-1 pl-6 text-xs text-indigo-600">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-5">
        <button
          onClick={onEvaluate}
          disabled={isEvaluating || !canEvaluate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {isEvaluating ? "Evaluating..." : "Finish & Evaluate Response"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}