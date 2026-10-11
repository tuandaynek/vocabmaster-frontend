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
  <main className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-100">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/vocab")}
            aria-label="Back to vocab"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900 text-slate-300 shadow-sm transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
              Vocabulary AI
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl tracking-tight">
              Vocab Extractor
            </h1>
          </div>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 sm:flex">
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