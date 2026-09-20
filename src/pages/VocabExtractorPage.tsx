import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useVocabExtractor } from "@/features/vocab/hooks/useVocabExtractor";
import { PassageEditor } from "@/features/vocab/components/PassageEditor";
import { ExtractionConfig } from "@/features/vocab/components/ExtractionConfig";
import { ResultsWorkspace } from "@/features/vocab/components/ResultsWorkspace";

export default function VocabExtractorPage() {
  const navigate = useNavigate();
  const {
    passageText,
    setPassageText,
    limit,
    setLimit,
    focusMode,
    setFocusMode,
    mustIncludeWords,
    setMustIncludeWords,
    extractedList,
    hasExtracted,
    loading,
    handleExtract,
    handleSave,
    toggleAll,
    toggleItem,
  } = useVocabExtractor();

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Back to home"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Vocabulary AI
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Vocab Extractor
              </h1>
            </div>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 sm:flex">
            <FileText className="h-5 w-5" />
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <PassageEditor
            passageText={passageText}
            loading={loading}
            onChange={setPassageText}
            onExtract={handleExtract}
          />
          <ExtractionConfig
            focusMode={focusMode}
            limit={limit}
            mustIncludeWords={mustIncludeWords}
            onFocusModeChange={setFocusMode}
            onLimitChange={setLimit}
            onMustIncludeWordsChange={setMustIncludeWords}
          />
        </div>

        {hasExtracted && (
          <ResultsWorkspace
            extractedList={extractedList}
            onToggleAll={toggleAll}
            onToggle={toggleItem}
            onSave={handleSave}
          />
        )}
      </div>
    </main>
  );
}