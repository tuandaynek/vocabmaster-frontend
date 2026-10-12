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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border-2 border-slate-100 bg-white p-6 text-slate-800 shadow-xl animate-in zoom-in-95 duration-200 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-800">
              Select Mode
            </span>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-800 sm:text-2xl">
              How would you like to practice?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mode selection"
            className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-2 text-slate-600 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          &ldquo;{question.text}&rdquo;
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onGuided}
            className="flex flex-col items-start gap-2.5 rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 text-left transition hover:border-sky-300 hover:bg-sky-100"
          >
            <Compass className="h-6 w-6 text-sky-700" />
            <div>
              <p className="font-bold text-slate-800">Guided Practice</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Get AI hints, translate ideas, and interact with an AI Examiner.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onMock}
            className="flex flex-col items-start gap-2.5 rounded-2xl border-2 border-slate-100 bg-white p-5 text-left transition hover:border-amber-200 hover:bg-amber-50"
          >
            <ShieldCheck className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-bold text-slate-800">Mock Test</p>
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