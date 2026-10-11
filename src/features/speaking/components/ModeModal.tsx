import { Compass, ShieldCheck, X } from "lucide-react";
import type { Question } from "../types/speaking.types";

interface ModeModalProps {
  question: Question;
  onClose: () => void;
  onGuided: () => void;
  onMock: () => void;
}

export function ModeModal({ question, onClose, onGuided, onMock }: ModeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8 text-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 text-xs font-bold text-indigo-400">
              Select Mode
            </span>
            <h2 className="mt-3 text-xl font-black text-white sm:text-2xl tracking-tight">
              How would you like to practice?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm font-semibold text-slate-200">
          &ldquo;{question.text}&rdquo;
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <button
            onClick={onGuided}
            className="flex flex-col items-start gap-2.5 rounded-2xl border-2 border-indigo-500/80 bg-indigo-950/30 p-5 text-left transition hover:bg-indigo-950/50 shadow-lg shadow-indigo-500/10"
          >
            <Compass className="h-6 w-6 text-indigo-400" />
            <div>
              <p className="font-bold text-white">Guided Practice</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Get AI hints, translate ideas, and interact with an AI Examiner.
              </p>
            </div>
          </button>

          <button
            onClick={onMock}
            className="flex flex-col items-start gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
          >
            <ShieldCheck className="h-6 w-6 text-slate-400" />
            <div>
              <p className="font-bold text-slate-200">Mock Test</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Simulate real exam conditions without hints or instant feedback.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}