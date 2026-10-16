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
import { useRating } from "@/contexts/useRating";

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
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-title"
    >
      <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-3xl border-2 border-slate-100 bg-white text-slate-800 shadow-xl animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-100 bg-slate-50 p-6 sm:p-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Đã hoàn tất đánh giá
              </span>
            </div>
            <h2
              id="evaluation-title"
              className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl"
            >
              Báo cáo đánh giá Speaking
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Xem nhận xét chi tiết và bài mẫu nâng cấp của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => void handleSaveSession()}
              disabled={isSavingSession}
              className="h-11 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSavingSession ? "Đang lưu..." : "Lưu bài luyện tập"}
            </Button>
            <button
              type="button"
              onClick={handleCloseWithRating}
              className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
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
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                        ? "border-amber-200 bg-amber-50 shadow-sm"
                        : "border-slate-100 bg-white shadow-sm"
                    }`}
                  >
                    <p className="text-xs font-semibold leading-5 text-slate-500">
                      {label}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-black ${
                        isOverall ? "text-amber-700" : "text-slate-800"
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
            <Card className="rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Volume2 className="h-5 w-5 text-sky-600" />
                Bài nói của bạn
              </h3>
              {data.userAudioUrl && (
                <audio
                  controls
                  src={data.userAudioUrl}
                  className="my-3 w-full accent-emerald-500"
                />
              )}
              {data.transcript && (
                <p className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium leading-relaxed text-slate-700">
                  {data.transcript}
                </p>
              )}
            </Card>
          )}

          {/* Section: Coherence & Idea Development */}
          {data.coherenceFeedback && (
            <Card className="rounded-3xl border-2 border-teal-200 bg-teal-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-teal-900">
                  Coherence &amp; Idea Development
                </h3>
                <span className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-bold text-teal-800">
                  {data.coherenceFeedback.statusTag}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-700">
                {data.coherenceFeedback.analysis}
              </p>
              <div className="mt-3 rounded-2xl border border-teal-200 bg-white p-3 text-xs leading-relaxed text-teal-900">
                <strong className="text-teal-800">Gợi ý:</strong>{" "}
                {data.coherenceFeedback.actionableTip}
              </div>
            </Card>
          )}

          {/* Section 1: Examiner Strategy */}
          <Card className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-sky-900">
              <MessageSquare className="h-5 w-5 text-sky-700" />
              1. Tư duy &amp; Chiến lược phát triển ý
            </h3>
            <blockquote className="mt-3 rounded-2xl border border-sky-200 border-l-4 border-l-sky-400 bg-white px-4 py-3 text-xs font-medium italic leading-relaxed text-slate-700">
              💬 Góc nhìn Giám khảo: {data.strategyFeedback.examinerPerspective}
            </blockquote>
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-xs leading-relaxed text-sky-900">
              <span className="font-bold text-sky-800">
                Gợi ý hành động:
              </span>{" "}
              {data.strategyFeedback.actionableAdvice}
            </div>
          </Card>

          {/* Section 2: Grammar Corrections */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-800">
              2. Sửa lỗi Ngữ pháp
            </h3>
            <div className="space-y-3">
              {data.grammarCorrections.length > 0 ? (
                data.grammarCorrections.map((correction, index) => (
                  <Card
                    key={`${correction.original}-${index}`}
                    className="grid gap-3 rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_1.2fr]"
                  >
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-rose-700">
                        Original
                      </span>
                      {correction.original}
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Corrected
                      </span>
                      {correction.corrected}
                    </div>
                    <div className="p-1 text-xs leading-relaxed text-slate-600">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Giải thích
                      </span>
                      {correction.explanation}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Không có lỗi ngữ pháp được phát hiện. 🎉
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Lexical Upgrades */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-800">
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
                      className="rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs">
                          <span className="text-slate-500">
                            {item.original}
                          </span>
                          <span className="mx-2 font-bold text-emerald-600">
                            ➜
                          </span>
                          <span className="font-bold text-emerald-800">
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
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              : "border-b-4 border-emerald-700 bg-emerald-500 text-white hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
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
                      <p className="mt-2 text-xs text-slate-600">
                        {item.meaning}
                      </p>
                      {item.example && (
                        <p className="mt-2 text-[11px] italic leading-relaxed text-slate-500">
                          Ví dụ: {item.example}
                        </p>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-2 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Không có collocation cần nâng cấp.
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Pronunciation */}
          <Card className="rounded-3xl border-2 border-violet-200 bg-violet-50 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-violet-900">
              4. Phát âm &amp; Trọng âm (Pronunciation)
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.pronunciationFeedback.length > 0 ? (
                data.pronunciationFeedback.map((item, index) => (
                  <Card
                    key={`${item.word}-${index}`}
                    className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {item.word}
                        </span>
                        <button
                          onClick={() => void handlePlaySample(item.word)}
                          className="rounded-xl p-1.5 text-violet-700 transition hover:bg-violet-50"
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
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {item.severity === "CRITICAL"
                            ? "Ảnh hưởng độ hiểu"
                            : "Lỗi nhẹ"}
                        </span>
                        <span className="rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-0.5 font-mono text-xs text-violet-800">
                          {item.ipa}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-rose-700">
                      <span className="font-bold">Lỗi:</span> {item.issue}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      <span className="font-bold text-violet-800">Mẹo:</span>{" "}
                      {item.tip}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Không có nhận xét phát âm.
                </div>
              )}
            </div>
          </Card>

          {/* Section 5: Fluency */}
          <Card className="rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">
              5. Độ trôi chảy &amp; Ngắt nhịp (Fluency)
            </h3>

            {data.wordTimestamps && data.wordTimestamps.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed shadow-sm">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                  {data.wordTimestamps.map((item, index) => {
                    const next = data.wordTimestamps?.[index + 1];
                    const gap = next ? next.start - item.end : 0;

                    return (
                      <span
                        key={`${item.word}-${index}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
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
                <div className="mt-4 flex gap-4 text-xs font-sans text-slate-500">
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nhịp độ &amp; khoảng dừng
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {data.fluencyFeedback.pacingAndPauses}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Hướng dẫn ngắt nhịp
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  {data.fluencyFeedback.chunkingTip}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 6: Model Answer */}
          <Card className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-amber-900">
                <Sparkles className="h-5 w-5 text-amber-600" />
                6. Bài mẫu nâng cấp Band 7.0+
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyModelAnswer}
                className="h-9 rounded-xl border-2 border-b-4 border-amber-300 bg-white text-xs font-bold text-amber-900 transition-all duration-150 hover:bg-amber-100 active:translate-y-1 active:border-b-2"
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Sao chép
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-amber-200 bg-white p-5 text-xs font-medium leading-relaxed text-slate-700 shadow-inner">
              {data.sampleAnswer}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
