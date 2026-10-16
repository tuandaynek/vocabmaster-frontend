import { useState } from 'react';
import { Crown, Flame, X, Zap } from 'lucide-react';
import type { GameStage } from '../../types/grammarData';
import type { SessionIntensity } from '../../types/gameAnalytics';
import { useGameSound } from '../../hooks/useGameSound';

export type { SessionIntensity } from '../../types/gameAnalytics';

interface SessionCustomizerModalProps {
  stages: GameStage[];
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onStart: (stages: GameStage[], intensity: SessionIntensity) => void;
}

const INTENSITIES: {
  id: SessionIntensity;
  title: string;
  detail: string;
  stageLimit: number;
  questionLimit: number;
  icon: typeof Zap;
  style: string;
}[] = [
  {
    id: 'quick',
    title: 'Ôn nhanh',
    detail: '5 câu · 1 chặng',
    stageLimit: 1,
    questionLimit: 5,
    icon: Zap,
    style: 'border-amber-200 bg-amber-50 text-amber-800'
  },
  {
    id: 'standard',
    title: 'Tiêu chuẩn',
    detail: '10 câu · 3 chặng',
    stageLimit: 3,
    questionLimit: 10,
    icon: Flame,
    style: 'border-orange-200 bg-orange-50 text-orange-800'
  },
  {
    id: 'full',
    title: 'Thử thách tối đa',
    detail: 'Toàn bộ nội dung',
    stageLimit: Number.POSITIVE_INFINITY,
    questionLimit: Number.POSITIVE_INFINITY,
    icon: Crown,
    style: 'border-violet-200 bg-violet-50 text-violet-800'
  }
];

function limitStageQuestions(stage: GameStage, questionLimit: number): GameStage {
  switch (stage.type) {
    case 'puzzle':
      return { ...stage, questions: stage.questions.slice(0, questionLimit) };
    case 'error':
      return { ...stage, questions: stage.questions.slice(0, questionLimit) };
    case 'speed':
      return { ...stage, questions: stage.questions.slice(0, questionLimit) };
    case 'transformer':
      return { ...stage, questions: stage.questions.slice(0, questionLimit) };
    case 'context':
      return { ...stage, questions: stage.questions.slice(0, questionLimit) };
  }
}

export default function SessionCustomizerModal({
  stages,
  loading = false,
  error,
  onClose,
  onStart,
}: SessionCustomizerModalProps) {
  const { playSelect } = useGameSound();
  const [selected, setSelected] = useState<SessionIntensity>('standard');
  const mode = INTENSITIES.find(option => option.id === selected) ?? INTENSITIES[1];
  let remainingQuestions = mode.questionLimit;
  const configuredStages: GameStage[] = [];

  for (const stage of stages.slice(0, mode.stageLimit)) {
    if (remainingQuestions <= 0) break;
    const limitedStage = limitStageQuestions(stage, remainingQuestions);
    if (limitedStage.questions.length === 0) continue;
    configuredStages.push(limitedStage);
    remainingQuestions -= limitedStage.questions.length;
  }

  const availableQuestions = configuredStages.reduce((total, stage) => total + stage.questions.length, 0);

  const handleClose = () => {
    playSelect();
    onClose();
  };

  const handleStart = () => {
    if (configuredStages.length === 0) return;
    playSelect();
    onStart(configuredStages, selected);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm animate-pop-in">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-customizer-title"
        className="w-full max-w-xl space-y-6 rounded-3xl border-2 border-white bg-white/95 p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur-md sm:p-7"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">CÁ NHÂN HÓA BUỔI HỌC</span>
            <h2 id="session-customizer-title" className="mt-2 text-2xl font-black text-slate-800">Chọn nhịp luyện tập</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Chọn mức phù hợp với thời gian và năng lượng của bạn.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng tùy chỉnh buổi học"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 border-slate-300 bg-slate-100 text-slate-600 active:translate-y-1 active:border-b-0"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-3">
          {INTENSITIES.map(option => {
            const Icon = option.icon;
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  playSelect();
                  setSelected(option.id);
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left transition active:translate-y-1 active:border-b-0 ${
                  isSelected ? `${option.style} border-b-current shadow-md` : 'border-slate-100 border-b-slate-200 bg-white text-slate-700 hover:border-indigo-200'
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isSelected ? 'bg-white/80' : 'bg-slate-100'}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{option.title}</span>
                  <span className="mt-0.5 block text-xs font-bold opacity-75">{option.detail}</span>
                </span>
                <span className={`h-5 w-5 rounded-full border-2 ${isSelected ? 'border-current bg-current shadow-[inset_0_0_0_4px_white]' : 'border-slate-300'}`} />
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold leading-relaxed text-sky-900">
          Chủ đề đã chọn có <strong>{availableQuestions} câu</strong> trên <strong>{configuredStages.length} chặng</strong> ở mức này. Số lượng thực tế tùy theo bài tập hiện có.
        </div>
        {loading && (
          <p role="status" className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
            Đang tải nội dung luyện tập...
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={configuredStages.length === 0 || loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-500 to-teal-500 px-5 py-4 font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🚀 Bắt đầu {selected === 'quick' ? 'ôn nhanh' : selected === 'full' ? 'thử thách' : 'luyện tập'}
        </button>
      </section>
    </div>
  );
}
