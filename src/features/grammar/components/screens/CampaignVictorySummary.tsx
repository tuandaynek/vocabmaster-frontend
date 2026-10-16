import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Clock3, Heart, Sparkles, Target, Trophy } from 'lucide-react';
import type { CampaignAnswer, SessionIntensity } from '../../types/gameAnalytics';
import { useGameSound } from '../../hooks/useGameSound';

interface CampaignVictorySummaryProps {
  xpEarned: number;
  livesRemaining: number;
  elapsedSeconds: number;
  intensity: SessionIntensity;
  answers: CampaignAnswer[];
  onExit: () => void;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
}

export default function CampaignVictorySummary({
  xpEarned,
  livesRemaining,
  elapsedSeconds,
  intensity,
  answers,
  onExit
}: CampaignVictorySummaryProps) {
  const { playSelect } = useGameSound();
  const [showMistakes, setShowMistakes] = useState(true);
  const mistakes = answers.filter(answer => !answer.isCorrect);
  const accuracyBySubTopic = [...answers.reduce((groups, answer) => {
    const group = groups.get(answer.subTopicTitle) ?? { correct: 0, total: 0 };
    group.total += 1;
    if (answer.isCorrect) group.correct += 1;
    groups.set(answer.subTopicTitle, group);
    return groups;
  }, new Map<string, { correct: number; total: number }>())];
  const totalCorrect = answers.filter(answer => answer.isCorrect).length;
  const totalAccuracy = answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0;
  const intensityLabel = intensity === 'quick' ? 'Ôn nhanh' : intensity === 'full' ? 'Thử thách tối đa' : 'Tiêu chuẩn';

  const handleExit = () => {
    playSelect();
    onExit();
  };

  return (
    <main className="grammar-hub min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6 animate-pop-in">
        <section className="overflow-hidden rounded-3xl border-2 border-white bg-white/95 text-center shadow-2xl shadow-amber-200/50 backdrop-blur-md">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-6 py-8 text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-b-4 border-amber-700 bg-white/25 shadow-lg">
              <Trophy className="h-9 w-9" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-white/80">Chiến dịch hoàn tất</p>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">Bạn làm chủ cuộc chơi! 🎉</h1>
            <p className="mt-2 font-bold text-white/90">Cùng nhìn lại hành trình ngữ pháp của bạn.</p>
            <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white">{intensityLabel}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3 md:p-6">
            <article className="rounded-2xl border-2 border-amber-100 bg-amber-50 p-4">
              <Sparkles className="mx-auto h-6 w-6 text-amber-500" />
              <p className="mt-2 text-2xl font-black text-amber-700">+{xpEarned} XP</p>
              <p className="text-xs font-bold text-amber-600">XP kiếm được</p>
            </article>
            <article className="rounded-2xl border-2 border-rose-100 bg-rose-50 p-4">
              <Heart className="mx-auto h-6 w-6 fill-rose-400 text-rose-500" />
              <p className="mt-2 text-2xl font-black text-rose-700">{livesRemaining}/5</p>
              <p className="text-xs font-bold text-rose-600">Tim còn lại</p>
            </article>
            <article className="rounded-2xl border-2 border-sky-100 bg-sky-50 p-4">
              <Clock3 className="mx-auto h-6 w-6 text-sky-500" />
              <p className="mt-2 text-lg font-black text-sky-700">{formatDuration(elapsedSeconds)}</p>
              <p className="text-xs font-bold text-sky-600">Thời gian luyện tập</p>
            </article>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border-2 border-white bg-white/95 p-5 shadow-xl shadow-indigo-100/60 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
                <Target className="h-5 w-5 text-indigo-500" /> Độ chính xác theo chuyên đề
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Tổng thể: <strong className="text-indigo-700">{totalAccuracy}%</strong> ({totalCorrect}/{answers.length} lượt trả lời đúng)
              </p>
            </div>
          </div>

          {accuracyBySubTopic.length > 0 ? (
            <div className="space-y-3">
              {accuracyBySubTopic.map(([title, result]) => {
                const accuracy = Math.round((result.correct / result.total) * 100);
                return (
                  <article key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <h3 className="font-black text-slate-700">{title}</h3>
                      <span className="shrink-0 font-black text-indigo-700">{accuracy}% · {result.correct}/{result.total}</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`Độ chính xác ${title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={accuracy}
                      className="h-2.5 overflow-hidden rounded-full bg-slate-200"
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-[width]" style={{ width: `${accuracy}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-500">Chưa có lượt trả lời được ghi nhận.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border-2 border-white bg-white/95 shadow-xl shadow-rose-100/60">
          <button
            type="button"
            aria-expanded={showMistakes}
            onClick={() => {
              playSelect();
              setShowMistakes(value => !value);
            }}
            className="flex w-full items-center justify-between gap-4 p-5 text-left active:translate-y-0 md:p-6"
          >
            <span>
              <span className="block text-lg font-black text-slate-800">🔎 Ôn lại câu sai</span>
              <span className="mt-1 block text-sm font-medium text-slate-500">
                {mistakes.length > 0 ? `${mistakes.length} câu cần xem lại` : 'Tuyệt vời! Bạn không mắc lỗi nào.'}
              </span>
            </span>
            {showMistakes ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
          </button>
          {showMistakes && mistakes.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 p-5 md:p-6">
              {mistakes.map((mistake, index) => (
                <article key={`${mistake.stageId}-${mistake.questionId}-${index}`} className="rounded-2xl border-2 border-rose-100 bg-rose-50/70 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-rose-600">{mistake.subTopicTitle}</p>
                  <p className="mt-2 font-bold leading-relaxed text-slate-800">{mistake.prompt}</p>
                  <p className="mt-2 text-sm font-medium text-rose-700">
                    Lựa chọn của bạn: <strong>{mistake.submittedAnswer}</strong>
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-700">
                    Đáp án đúng: <strong>{mistake.correctAnswer}</strong>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={handleExit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-indigo-800 bg-indigo-500 px-5 py-4 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-600 active:translate-y-1 active:border-b-0"
        >
          <ArrowLeft className="h-5 w-5" /> Về bản đồ Grammar Quest
        </button>
      </div>
    </main>
  );
}
