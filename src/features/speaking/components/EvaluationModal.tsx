import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Save,
  Volume2,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { speakingApi } from "../api/speakingApi";
import type { EvaluationResponse } from "../types/speaking.types";

interface EvaluationModalProps {
  isOpen: boolean;
  data: EvaluationResponse | null;
  question: string;
  onClose: () => void;
}

const SCORE_ITEMS: Array<{
  key: keyof EvaluationResponse["bandScores"];
  label: string;
}> = [
  { key: "fluencyCoherence", label: "Fluency & Coherence" },
  { key: "lexicalResource", label: "Lexical Resource" },
  { key: "grammarAccuracy", label: "Grammar Range & Accuracy" },
  { key: "pronunciation", label: "Pronunciation" },
  { key: "overall", label: "Overall Band" },
];

export function EvaluationModal({
  isOpen,
  data,
  question,
  onClose,
}: EvaluationModalProps) {
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [savingWord, setSavingWord] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(() => new Set());
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Revoke object URL khi đóng modal để tránh memory leak
  useEffect(() => {
    if (!isOpen && data?.userAudioUrl) {
      URL.revokeObjectURL(data.userAudioUrl);
    }
  }, [isOpen, data?.userAudioUrl]);

  if (!isOpen || !data) return null;

  // Handler: Phát âm mẫu
  const handlePlaySample = async (word: string) => {
    setPlayingWord(word);
    try {
      const blob = await speakingApi.getPronunciationSample(word);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPlayingWord(null);
      };

      await audio.play();
    } catch {
      setPlayingWord(null);
      toast.error("Không thể phát audio mẫu lúc này.");
    }
  };

  // Handler: Sao chép bài mẫu
  const handleCopyModelAnswer = async () => {
    try {
      await navigator.clipboard.writeText(data.sampleAnswer);
      toast.success("Đã sao chép bài mẫu.");
    } catch {
      toast.error("Không thể sao chép bài mẫu.");
    }
  };

  // Handler: Lưu từ vựng/collocation
  const handleSaveCollocation = async (
    item: EvaluationResponse["lexicalUpgrades"][number]
  ) => {
    if (savedWords.has(item.upgrade)) return;
    setSavingWord(item.upgrade);

    try {
      await speakingApi.saveVocabularyUpgrade({
        originalWord: item.original,
        upgradedWord: item.upgrade,
        meaning: item.meaning,
        example: item.example,
        topic: question,
      });

      setSavedWords((prev) => new Set(prev).add(item.upgrade));
      toast.success(`Đã thêm "${item.upgrade}" vào danh sách từ vựng.`);
    } catch {
      toast.error("Không thể lưu từ vựng lúc này.");
    } finally {
      setSavingWord(null);
    }
  };

  // Handler: Lưu toàn bộ session luyện tập
  const handleSaveSession = async () => {
    setIsSavingSession(true);
    try {
      await speakingApi.saveSpeakingHistory({
        question,
        audioUrl: data.userAudioUrl,
        transcript: data.transcript,
        overallBand: data.bandScores.overall,
        detailedScores: data.bandScores,
        createdAt: new Date().toISOString(),
      });
      toast.success("Đã lưu bài luyện tập thành công!");
    } catch {
      toast.error("Không thể lưu bài luyện tập lúc này.");
    } finally {
      setIsSavingSession(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-title"
    >
      <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-50 zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Đã hoàn tất đánh giá
              </span>
            </div>
            <h2
              id="evaluation-title"
              className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Báo cáo đánh giá Speaking
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Xem nhận xét chi tiết và bài mẫu nâng cấp của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => void handleSaveSession()}
              disabled={isSavingSession}
              className="bg-indigo-600 font-bold text-white hover:bg-indigo-700"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSavingSession ? "Đang lưu..." : "Lưu bài luyện tập"}
            </Button>
            <button
              onClick={onClose}
              className="rounded-2xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Đóng báo cáo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="space-y-8 p-6 sm:p-8">

          {/* Section: Band Scores */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Band Scores
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {SCORE_ITEMS.map(({ key, label }) => {
                const score = data.bandScores[key];
                const isOverall = key === "overall";

                return (
                  <Card
                    key={key}
                    className={`p-4 transition-all ${
                      isOverall
                        ? "border-indigo-200 bg-indigo-50/80 shadow-sm"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <p className="text-xs font-semibold leading-5 text-slate-500">
                      {label}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-bold ${
                        isOverall ? "text-indigo-700" : "text-slate-900"
                      }`}
                    >
                      {score === null ? "N/A" : score.toFixed(1)}
                    </p>
                    {key === "pronunciation" && score === null && (
                      <p className="mt-1 text-[11px] leading-4 text-slate-400">
                        Chỉ áp dụng khi thu âm
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Section: Audio & Transcript */}
          {(data.userAudioUrl || data.transcript) && (
            <Card className="border-slate-200 bg-slate-50/50 p-5">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Volume2 className="h-5 w-5 text-indigo-600" />
                Bài nói của bạn
              </h3>
              {data.userAudioUrl && (
                <audio controls src={data.userAudioUrl} className="my-3 w-full" />
              )}
              {data.transcript && (
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
                  {data.transcript}
                </p>
              )}
            </Card>
          )}

          {/* Section: Coherence & Idea Development */}
          {data.coherenceFeedback && (
            <Card className="border-teal-200 bg-teal-50/50 p-5">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-teal-950">
                  Coherence &amp; Idea Development
                </h3>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                  {data.coherenceFeedback.statusTag}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {data.coherenceFeedback.analysis}
              </p>
              <div className="mt-3 rounded-xl border border-teal-100 bg-white/80 p-3 text-sm leading-relaxed text-teal-950 shadow-sm">
                <strong>Gợi ý:</strong> {data.coherenceFeedback.actionableTip}
              </div>
            </Card>
          )}

          {/* Section 1: Examiner Strategy */}
          <Card className="border-indigo-200 bg-indigo-50/50 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-950">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              1. Tư duy &amp; Chiến lược phát triển ý
            </h3>
            <blockquote className="mt-3 rounded-xl border-l-4 border-indigo-500 bg-white/90 px-4 py-3 text-sm font-medium italic leading-relaxed text-slate-700 shadow-sm">
              💬 Góc nhìn Giám khảo: {data.strategyFeedback.examinerPerspective}
            </blockquote>
            <div className="mt-3 rounded-xl bg-indigo-100/70 px-4 py-3 text-sm leading-relaxed text-indigo-950">
              <span className="font-bold">Gợi ý hành động:</span>{" "}
              {data.strategyFeedback.actionableAdvice}
            </div>
          </Card>

          {/* Section 2: Grammar Corrections */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              2. Sửa lỗi Ngữ pháp
            </h3>
            <div className="space-y-3">
              {data.grammarCorrections.length > 0 ? (
                data.grammarCorrections.map((correction, index) => (
                  <Card
                    key={`${correction.original}-${index}`}
                    className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1.2fr]"
                  >
                    <div className="rounded-xl bg-rose-50/60 p-3 text-sm text-rose-800">
                      <span className="mb-1 block text-xs font-bold uppercase text-rose-500">
                        Original
                      </span>
                      {correction.original}
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 p-3 text-sm text-emerald-800">
                      <span className="mb-1 block text-xs font-bold uppercase text-emerald-500">
                        Corrected
                      </span>
                      {correction.corrected}
                    </div>
                    <div className="p-1 text-sm leading-relaxed text-slate-600">
                      <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
                        Giải thích
                      </span>
                      {correction.explanation}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                  Không có lỗi ngữ pháp được phát hiện. 🎉
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Lexical Upgrades */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              3. Nâng cấp Từ vựng &amp; Collocations
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.lexicalUpgrades.length > 0 ? (
                data.lexicalUpgrades.map((item, index) => {
                  const isSaved = savedWords.has(item.upgrade);
                  const isSaving = savingWord === item.upgrade;

                  return (
                    <Card key={`${item.upgrade}-${index}`} className="p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm">
                          <span className="text-slate-500">{item.original}</span>
                          <span className="mx-2 font-bold text-indigo-500">➜</span>
                          <span className="font-bold text-indigo-700">
                            {item.upgrade}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          onClick={() => void handleSaveCollocation(item)}
                          disabled={isSaving || isSaved}
                          className={`h-8 text-xs font-bold ${
                            isSaved
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          }`}
                        >
                          <Save className="mr-1 h-3.5 w-3.5" />
                          {isSaved ? "Saved" : isSaving ? "Saving..." : "Save Word"}
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.meaning}</p>
                      {item.example && (
                        <p className="mt-2 text-xs italic leading-relaxed text-slate-500">
                          Ví dụ: {item.example}
                        </p>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                  Không có collocation cần nâng cấp.
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Pronunciation */}
          <Card className="border-violet-200 bg-violet-50/50 p-5">
            <h3 className="text-lg font-bold text-violet-950">
              4. Phát âm &amp; Trọng âm (Pronunciation)
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.pronunciationFeedback.length > 0 ? (
                data.pronunciationFeedback.map((item, index) => (
                  <Card
                    key={`${item.word}-${index}`}
                    className="border-violet-100 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.word}</span>
                        <button
                          onClick={() => void handlePlaySample(item.word)}
                          className="rounded-lg p-1.5 text-violet-600 hover:bg-violet-50"
                          title="Nghe phát âm mẫu"
                          aria-label={`Nghe phát âm ${item.word}`}
                        >
                          <Volume2
                            className={`h-4 w-4 ${
                              playingWord === item.word ? "animate-pulse" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.severity === "CRITICAL"
                            ? "Ảnh hưởng độ hiểu"
                            : "Lỗi nhẹ"}
                        </span>
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 font-mono text-xs text-violet-700">
                          {item.ipa}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-rose-700">
                      <span className="font-bold">Lỗi:</span> {item.issue}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      <span className="font-bold text-violet-800">Mẹo:</span>{" "}
                      {item.tip}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 rounded-xl border border-dashed border-violet-200 p-4 text-center text-sm text-slate-500">
                  Không có nhận xét phát âm.
                </div>
              )}
            </div>
          </Card>

          {/* Section 5: Fluency */}
          <Card className="border-slate-200 bg-slate-50/50 p-5">
            <h3 className="text-lg font-bold text-slate-900">
              5. Độ trôi chảy &amp; Ngắt nhịp (Fluency)
            </h3>

            {/* Visual Word Timestamps */}
            {data.wordTimestamps && data.wordTimestamps.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed shadow-sm">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                  {data.wordTimestamps.map((item, index) => {
                    const next = data.wordTimestamps?.[index + 1];
                    const gap = next ? next.start - item.end : 0;

                    return (
                      <span
                        key={`${item.word}-${index}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-800">
                          {item.word}
                        </span>
                        {gap >= 1.2 ? (
                          <span
                            className="h-2 w-6 rounded-full bg-rose-500"
                            title={`Dừng dài ${gap.toFixed(1)}s`}
                          />
                        ) : gap >= 0.5 ? (
                          <span
                            className="h-2.5 w-2.5 rounded-full bg-amber-400"
                            title={`Dừng vừa ${gap.toFixed(1)}s`}
                          />
                        ) : null}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-4 text-xs font-sans text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Ngắt vừa
                    (0.5s - 1.2s)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-4 rounded-full bg-rose-500" /> Ngắt dài
                    (&gt;1.2s)
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nhịp độ &amp; khoảng dừng
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {data.fluencyFeedback.pacingAndPauses}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hướng dẫn ngắt nhịp
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {data.fluencyFeedback.chunkingTip}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 6: Model Answer */}
          <Card className="border-indigo-200 bg-indigo-50/50 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-950">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                6. Bài mẫu nâng cấp Band 7.0+
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyModelAnswer}
                className="border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Sao chép
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-indigo-100 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-sm">
              {data.sampleAnswer}
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}