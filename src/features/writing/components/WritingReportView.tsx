import ReactMarkdown from "react-markdown";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Evaluation } from "../types/writing.types";

interface WritingReportViewProps {
  evaluation: Evaluation;
  targetBand: string;
  onBackToWorkspace: () => void;
  onResetSession: () => void;
}

const SCORE_LABELS: Record<string, string> = {
  taskResponse: "Task Response",
  coherenceCohesion: "Coherence",
  lexicalResource: "Lexical",
  grammaticalRange: "Grammar",
  overall: "Overall",
};

export function WritingReportView({
  evaluation,
  targetBand,
  onBackToWorkspace,
  onResetSession,
}: WritingReportViewProps) {
  const criteriaKeys = [
    "taskResponse",
    "coherenceCohesion",
    "lexicalResource",
    "grammaticalRange",
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWorkspace}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Quay lại workspace"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                Examiner report
              </p>
              <h1 className="font-bold">Writing Task 2 Feedback</h1>
            </div>
          </div>
          <button
            onClick={onResetSession}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" /> Bài mới
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Counselor Summary */}
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <p className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Counselor summary
          </p>
          <p className="leading-7">{evaluation.counselorSummary}</p>
        </section>

        {/* Scores overview */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {(["overall", ...criteriaKeys] as const).map((key) => (
            <div
              key={key}
              className={`rounded-2xl border p-4 dark:border-slate-800 dark:bg-slate-900 ${
                key === "overall"
                  ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs text-slate-500">{SCORE_LABELS[key] || key}</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {evaluation.bandScores[key]}
              </p>
            </div>
          ))}
        </section>

        {/* Detailed breakdown */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Detailed criteria breakdown</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {criteriaKeys.map((key) => {
              const diagnostic = evaluation.criteriaDiagnostics[key];
              if (!diagnostic) return null;
              return (
                <article
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="mb-4 font-bold text-indigo-600">{SCORE_LABELS[key]}</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="mb-2 font-semibold text-emerald-600">✓ Strengths</p>
                      <ul className="space-y-2">
                        {diagnostic.strengths.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-emerald-500">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 font-semibold text-red-600">✗ Areas for improvement</p>
                      <ul className="space-y-2">
                        {diagnostic.weaknesses.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-red-500">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                      <p className="mb-1 font-semibold">Action plan</p>
                      <p>{diagnostic.actionPlan}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Corrections */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Key sentence upgrades</h2>
          <div className="space-y-4">
            {evaluation.inlineCorrections.map((item, index) => (
              <div
                key={`${item.originalSentence}-${index}`}
                className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700"
              >
                <span className="mb-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800">
                  {item.type}
                </span>
                <p className="text-red-600">
                  <strong>Original:</strong> {item.originalSentence}
                </p>
                <p className="mt-2 text-emerald-600">
                  <strong>Upgraded:</strong> {item.correctedSentence}
                </p>
                <p className="mt-2 text-slate-500">{item.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vocabulary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">High-value vocabulary</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {evaluation.highValueVocabulary.map((item) => (
              <div
                key={`${item.originalPhrase}-${item.band8Upgrade}`}
                className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950/50"
              >
                <p className="text-red-600">{item.originalPhrase}</p>
                <p className="font-semibold text-emerald-600">{item.band8Upgrade}</p>
                <p className="mt-2 text-slate-500">{item.contextExample}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Rewrite */}
        <section className="rounded-2xl border border-indigo-200 bg-white p-6 dark:border-indigo-900 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-bold">Incremental Upgrade</h2>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-7 dark:prose-invert">
            <ReactMarkdown>
              {evaluation.incrementalUpgradedEssay
                ? evaluation.incrementalUpgradedEssay.replace(/\\n/g, "\n")
                : ""}
            </ReactMarkdown>
          </div>
        </section>
      </main>
    </div>
  );
}