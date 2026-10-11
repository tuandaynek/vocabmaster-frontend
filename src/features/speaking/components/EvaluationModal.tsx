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
import { useRating } from "@/contexts/RatingContext";

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
  const { openRating } = useRating();
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
    item: EvaluationResponse["lexicalUpgrades"][number],
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

  // 3. Tạo hàm đóng modal có kèm kích hoạt Rating
  const handleCloseWithRating = () => {
    onClose();

    openRating({
      feature: "IELTS Speaking Evaluator",
      title: "Đánh giá chất lượng chấm bài Speaking",
      description:
        "Bạn thấy kết quả phân tích và bài mẫu Speaking lần này thế nào?",
      fastComments: [
        "Chấm điểm phát âm & lưu loát chuẩn",
        "Bài mẫu nâng cấp (Lexical) rất hay",
        "Audio mẫu phát âm rõ ràng",
        "Cần cải thiện độ chính xác của Transcript",
      ],
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/70 p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-title"
    >
      <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in-50 zoom-in-95 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 bg-slate-950/40 p-6 sm:p-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Đã hoàn tất đánh giá
              </span>
            </div>
            <h2
              id="evaluation-title"
              className="text-2xl font-black tracking-tight text-white sm:text-3xl"
            >
              Báo cáo đánh giá Speaking
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Xem nhận xét chi tiết và bài mẫu nâng cấp của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => void handleSaveSession()}
              disabled={isSavingSession}
              className="rounded-2xl bg-indigo-600 font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 h-11 px-4 text-xs"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSavingSession ? "Đang lưu..." : "Lưu bài luyện tập"}
            </Button>
            <button
              onClick={handleCloseWithRating}
              className="rounded-2xl p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white border border-slate-800"
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
                    className={`p-4 rounded-2xl border transition-all ${
                      isOverall
                        ? "border-indigo-500/40 bg-indigo-950/40 shadow-lg shadow-indigo-500/10"
                        : "border-slate-800 bg-slate-950/60"
                    }`}
                  >
                    <p className="text-xs font-semibold leading-5 text-slate-400">
                      {label}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-black ${
                        isOverall ? "text-indigo-400" : "text-white"
                      }`}
                    >
                      {score === null ? "N/A" : score.toFixed(1)}
                    </p>
                    {key === "pronunciation" && score === null && (
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
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
            <Card className="border-slate-800 bg-slate-950/60 p-5 rounded-3xl shadow-xl">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Volume2 className="h-5 w-5 text-indigo-400" />
                Bài nói của bạn
              </h3>
              {data.userAudioUrl && (
                <audio
                  controls
                  src={data.userAudioUrl}
                  className="my-3 w-full accent-indigo-500"
                />
              )}
              {data.transcript && (
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs font-medium leading-relaxed text-slate-300">
                  {data.transcript}
                </p>
              )}
            </Card>
          )}

          {/* Section: Coherence & Idea Development */}
          {data.coherenceFeedback && (
            <Card className="border-teal-500/30 bg-teal-950/20 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-teal-200">
                  Coherence &amp; Idea Development
                </h3>
                <span className="rounded-xl bg-teal-500/20 border border-teal-500/30 px-3 py-1 text-xs font-bold text-teal-300">
                  {data.coherenceFeedback.statusTag}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                {data.coherenceFeedback.analysis}
              </p>
              <div className="mt-3 rounded-2xl border border-teal-500/20 bg-slate-900 p-3 text-xs leading-relaxed text-teal-200">
                <strong className="text-teal-400">Gợi ý:</strong>{" "}
                {data.coherenceFeedback.actionableTip}
              </div>
            </Card>
          )}

          {/* Section 1: Examiner Strategy */}
          <Card className="border-indigo-500/30 bg-indigo-950/20 p-5 rounded-3xl shadow-xl">
            <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-200">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
              1. Tư duy &amp; Chiến lược phát triển ý
            </h3>
            <blockquote className="mt-3 rounded-2xl border-l-4 border-indigo-500 bg-slate-900 px-4 py-3 text-xs font-medium italic leading-relaxed text-slate-300 border border-slate-800">
              💬 Góc nhìn Giám khảo: {data.strategyFeedback.examinerPerspective}
            </blockquote>
            <div className="mt-3 rounded-2xl bg-indigo-900/40 border border-indigo-500/20 px-4 py-3 text-xs leading-relaxed text-indigo-200">
              <span className="font-bold text-indigo-300">
                Gợi ý hành động:
              </span>{" "}
              {data.strategyFeedback.actionableAdvice}
            </div>
          </Card>

          {/* Section 2: Grammar Corrections */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-white">
              2. Sửa lỗi Ngữ pháp
            </h3>
            <div className="space-y-3">
              {data.grammarCorrections.length > 0 ? (
                data.grammarCorrections.map((correction, index) => (
                  <Card
                    key={`${correction.original}-${index}`}
                    className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1.2fr] rounded-3xl border border-slate-800 bg-slate-950/60 shadow-xl"
                  >
                    <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Original
                      </span>
                      {correction.original}
                    </div>
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Corrected
                      </span>
                      {correction.corrected}
                    </div>
                    <div className="p-1 text-xs leading-relaxed text-slate-300">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Giải thích
                      </span>
                      {correction.explanation}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500 bg-slate-950/40">
                  Không có lỗi ngữ pháp được phát hiện. 🎉
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Lexical Upgrades */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-white">
              3. Nâng cấp Từ vựng &amp; Collocations
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.lexicalUpgrades.length > 0 ? (
                data.lexicalUpgrades.map((item, index) => {
                  const isSaved = savedWords.has(item.upgrade);
                  const isSaving = savingWord === item.upgrade;

                  return (
                    <Card
                      key={`${item.upgrade}-${index}`}
                      className="p-4 rounded-3xl border border-slate-800 bg-slate-950/60 shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs">
                          <span className="text-slate-400">
                            {item.original}
                          </span>
                          <span className="mx-2 font-bold text-indigo-400">
                            ➜
                          </span>
                          <span className="font-bold text-indigo-300">
                            {item.upgrade}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isSaved ? "outline" : "default"}
                          onClick={() => void handleSaveCollocation(item)}
                          disabled={isSaving || isSaved}
                          className={`h-8 text-[11px] font-bold rounded-xl border ${
                            isSaved
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500"
                          }`}
                        >
                          <Save className="mr-1 h-3.5 w-3.5" />
                          {isSaved
                            ? "Saved"
                            : isSaving
                              ? "Saving..."
                              : "Save Word"}
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-slate-300">
                        {item.meaning}
                      </p>
                      {item.example && (
                        <p className="mt-2 text-[11px] italic leading-relaxed text-slate-400">
                          Ví dụ: {item.example}
                        </p>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-2 rounded-3xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500 bg-slate-950/40">
                  Không có collocation cần nâng cấp.
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Pronunciation */}
          <Card className="border-violet-500/30 bg-violet-950/20 p-5 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-violet-200">
              4. Phát âm &amp; Trọng âm (Pronunciation)
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.pronunciationFeedback.length > 0 ? (
                data.pronunciationFeedback.map((item, index) => (
                  <Card
                    key={`${item.word}-${index}`}
                    className="border-slate-800 bg-slate-900 p-4 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {item.word}
                        </span>
                        <button
                          onClick={() => void handlePlaySample(item.word)}
                          className="rounded-xl p-1.5 text-violet-400 hover:bg-slate-800 transition"
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
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            item.severity === "CRITICAL"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }`}
                        >
                          {item.severity === "CRITICAL"
                            ? "Ảnh hưởng độ hiểu"
                            : "Lỗi nhẹ"}
                        </span>
                        <span className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 font-mono text-xs text-violet-300">
                          {item.ipa}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-rose-400">
                      <span className="font-bold">Lỗi:</span> {item.issue}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      <span className="font-bold text-violet-300">Mẹo:</span>{" "}
                      {item.tip}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500 bg-slate-950/40">
                  Không có nhận xét phát âm.
                </div>
              )}
            </div>
          </Card>

          {/* Section 5: Fluency */}
          <Card className="border-slate-800 bg-slate-950/60 p-5 rounded-3xl shadow-xl">
            <h3 className="text-lg font-bold text-white">
              5. Độ trôi chảy &amp; Ngắt nhịp (Fluency)
            </h3>

            {data.wordTimestamps && data.wordTimestamps.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs leading-relaxed shadow-sm">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                  {data.wordTimestamps.map((item, index) => {
                    const next = data.wordTimestamps?.[index + 1];
                    const gap = next ? next.start - item.end : 0;

                    return (
                      <span
                        key={`${item.word}-${index}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200">
                          {item.word}
                        </span>
                        {gap >= 1.2 ? (
                          <span
                            className="h-2 w-6 rounded-full bg-rose-500 shadow-sm"
                            title={`Dừng dài ${gap.toFixed(1)}s`}
                          />
                        ) : gap >= 0.5 ? (
                          <span
                            className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm"
                            title={`Dừng vừa ${gap.toFixed(1)}s`}
                          />
                        ) : null}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-4 text-xs font-sans text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />{" "}
                    Ngắt vừa (0.5s - 1.2s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full bg-rose-500" /> Ngắt
                    dài (&gt;1.2s)
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-900 p-4 shadow-sm border border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nhịp độ &amp; khoảng dừng
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {data.fluencyFeedback.pacingAndPauses}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 shadow-sm border border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hướng dẫn ngắt nhịp
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {data.fluencyFeedback.chunkingTip}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 6: Model Answer */}
          <Card className="border-indigo-500/30 bg-indigo-950/20 p-5 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-200">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                6. Bài mẫu nâng cấp Band 7.0+
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyModelAnswer}
                className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 rounded-xl text-xs font-bold h-9"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Sao chép
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-indigo-500/20 bg-slate-900 p-5 text-xs font-medium leading-relaxed text-slate-200 shadow-inner">
              {data.sampleAnswer}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
