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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWorkspace}
              className="rounded-2xl p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 transition"
              aria-label="Quay lại workspace"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Examiner report
              </p>
              <h1 className="font-black text-white text-base">
                Writing Task 2 Feedback
              </h1>
            </div>
          </div>
          <button
            onClick={onResetSession}
            className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <RotateCcw className="h-4 w-4" /> Bài mới
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Counselor Summary */}
        <section className="rounded-[32px] border border-indigo-500/30 bg-indigo-950/20 p-6 shadow-xl backdrop-blur-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            Counselor summary
          </p>
          <p className="text-sm leading-relaxed text-slate-300 font-medium">
            {evaluation.counselorSummary}
          </p>
        </section>

        {/* Scores overview */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {(["overall", ...criteriaKeys] as const).map((key) => (
            <div
              key={key}
              className={`rounded-2xl border p-4 shadow-xl transition ${
                key === "overall"
                  ? "border-indigo-500/40 bg-indigo-950/40 shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <p className="text-xs font-semibold text-slate-400">
                {SCORE_LABELS[key] || key}
              </p>
              <p className="mt-2 text-3xl font-black text-indigo-400">
                {evaluation.bandScores[key]}
              </p>
            </div>
          ))}
        </section>

        {/* Detailed breakdown */}
        <section>
          <h2 className="mb-4 text-lg font-black text-white tracking-tight">
            Detailed criteria breakdown
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {criteriaKeys.map((key) => {
              const diagnostic = evaluation.criteriaDiagnostics[key];
              if (!diagnostic) return null;
              return (
                <article
                  key={key}
                  className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl"
                >
                  <h3 className="mb-4 font-bold text-indigo-400 text-sm uppercase tracking-wider">
                    {SCORE_LABELS[key]}
                  </h3>
                  <div className="space-y-4 text-xs font-medium">
                    <div>
                      <p className="mb-2 font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        ✓ Strengths
                      </p>
                      <ul className="space-y-2">
                        {diagnostic.strengths.map((item) => (
                          <li key={item} className="flex gap-2 text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                        ✗ Areas for improvement
                      </p>
                      <ul className="space-y-2">
                        {diagnostic.weaknesses.map((item) => (
                          <li key={item} className="flex gap-2 text-slate-300">
                            <span className="text-rose-400">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/20 p-3.5 text-indigo-200 leading-relaxed">
                      <p className="mb-1 font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                        Action plan
                      </p>
                      <p>{diagnostic.actionPlan}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Corrections */}
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-black text-white tracking-tight">
            Key sentence upgrades
          </h2>
          <div className="space-y-4">
            {evaluation.inlineCorrections.map((item, index) => (
              <div
                key={`${item.originalSentence}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2"
              >
                <span className="inline-block rounded-xl bg-slate-900 border border-slate-800 px-3 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  {item.type}
                </span>
                <p className="text-rose-400 font-medium">
                  <strong className="text-rose-300">Original:</strong>{" "}
                  {item.originalSentence}
                </p>
                <p className="text-emerald-400 font-medium">
                  <strong className="text-emerald-300">Upgraded:</strong>{" "}
                  {item.correctedSentence}
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Vocabulary */}
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-black text-white tracking-tight">
            High-value vocabulary
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {evaluation.highValueVocabulary.map((item) => (
              <div
                key={`${item.originalPhrase}-${item.bandUpgrade}`}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-1.5"
              >
                <p className="text-rose-400 font-medium line-through">
                  {item.originalPhrase}
                </p>
                <p className="font-bold text-emerald-400">{item.bandUpgrade}</p>
                <p className="text-slate-400 leading-relaxed pt-1">
                  {item.contextExample}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Rewrite */}
        <section className="rounded-[32px] border border-indigo-500/30 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-black text-white tracking-tight">
            Incremental Upgrade
          </h2>
          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
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
