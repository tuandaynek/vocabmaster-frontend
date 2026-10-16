import ReactMarkdown from "react-markdown";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Evaluation } from "../types/writing.types";

interface WritingReportViewProps {
  evaluation: Evaluation;
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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWorkspace}
              className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              aria-label="Quay lại workspace"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Examiner report
              </p>
              <h1 className="text-base font-extrabold text-slate-800">
                Writing Task 2 Feedback
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetSession}
            className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
          >
            <RotateCcw className="h-4 w-4" /> Bài mới
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Counselor Summary */}
        <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            Counselor summary
          </p>
          <p className="text-sm font-medium leading-relaxed text-slate-700">
            {evaluation.counselorSummary}
          </p>
        </section>

        {/* Scores overview */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {(["overall", ...criteriaKeys] as const).map((key) => (
            <div
              key={key}
              className={`rounded-2xl border-2 p-4 shadow-sm transition ${
                key === "overall"
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-100 bg-white"
              }`}
            >
              <p className="text-xs font-semibold text-slate-500">
                {SCORE_LABELS[key] || key}
              </p>
              <p className={`mt-2 text-3xl font-extrabold ${key === "overall" ? "text-amber-700" : "text-slate-800"}`}>
                {evaluation.bandScores[key]}
              </p>
            </div>
          ))}
        </section>

        {/* Detailed breakdown */}
        <section>
          <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-800">
            Detailed criteria breakdown
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {criteriaKeys.map((key) => {
              const diagnostic = evaluation.criteriaDiagnostics[key];
              if (!diagnostic) return null;
              return (
                <article
                  key={key}
                  className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-sky-700">
                    {SCORE_LABELS[key]}
                  </h3>
                  <div className="space-y-4 text-xs font-medium">
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-700">
                        ✓ Strengths
                      </p>
                      <ul className="space-y-2">
                        {diagnostic.strengths.map((item) => (
                          <li key={item} className="flex gap-2 text-slate-700">
                            <span className="text-emerald-600">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-700">
                        ✗ Areas for improvement
                      </p>
                      <ul className="space-y-2">
                        {diagnostic.weaknesses.map((item) => (
                          <li key={item} className="flex gap-2 text-slate-700">
                            <span className="text-rose-600">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3.5 leading-relaxed text-sky-900">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sky-800">
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
        <section className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-800">
            Key sentence upgrades
          </h2>
          <div className="space-y-4">
            {evaluation.inlineCorrections.map((item, index) => (
              <div
                key={`${item.originalSentence}-${index}`}
                className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs"
              >
                <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {item.type}
                </span>
                <p className="font-medium text-rose-700">
                  <strong className="text-rose-800">Original:</strong>{" "}
                  {item.originalSentence}
                </p>
                <p className="font-medium text-emerald-700">
                  <strong className="text-emerald-800">Upgraded:</strong>{" "}
                  {item.correctedSentence}
                </p>
                <p className="leading-relaxed text-slate-600">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Vocabulary */}
        <section className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-800">
            High-value vocabulary
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {evaluation.highValueVocabulary.map((item) => (
              <div
                key={`${item.originalPhrase}-${item.bandUpgrade}`}
                className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs"
              >
                <p className="font-medium text-rose-700 line-through">
                  {item.originalPhrase}
                </p>
                <p className="font-bold text-emerald-800">{item.bandUpgrade}</p>
                <p className="pt-1 leading-relaxed text-slate-600">
                  {item.contextExample}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Rewrite */}
        <section className="rounded-3xl border-2 border-violet-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-800">
            Incremental Upgrade
          </h2>
          <div className="prose max-w-none whitespace-pre-wrap text-xs leading-relaxed text-slate-700 prose-headings:text-slate-800 prose-strong:text-slate-800 prose-a:text-emerald-700">
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
