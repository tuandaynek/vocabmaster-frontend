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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              Select Mode
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              How would you like to practice?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-800">
          “{question.text}”
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onGuided}
            className="flex flex-col items-start gap-2 rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 p-5 text-left transition hover:bg-indigo-50"
          >
            <Compass className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="font-bold text-indigo-950">Guided Practice</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Get AI hints, translate ideas, and interact with an AI Examiner.
              </p>
            </div>
          </button>

          <button
            onClick={onMock}
            className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ShieldCheck className="h-6 w-6 text-slate-600" />
            <div>
              <p className="font-bold text-slate-900">Mock Test</p>
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