import { ArrowRight, BookOpen, Check, Gamepad2, X } from 'lucide-react';
import { useState } from 'react';
import type { GrammarTopic, SubTopic } from '../../types/grammarData';
import { useGameSound } from '../../hooks/useGameSound';
import { BASE_XP_BY_GAME_TYPE } from '../../constants/grammarConstants';

interface TopicDetailModalProps {
  topic: GrammarTopic;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onChooseTheory: (subTopics: SubTopic[]) => void;
  onStartPractice: (subTopics: SubTopic[]) => void;
}

export default function TopicDetailModal({
  topic,
  loading = false,
  error,
  onClose,
  onChooseTheory,
  onStartPractice
}: TopicDetailModalProps) {
  const { playSelect } = useGameSound();
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    topic.subTopics?.[0] ? [topic.subTopics[0].id] : []
  );
  const subTopics = topic.subTopics ?? [];
  const selectedSubTopics = subTopics.filter(subTopic => selectedIds.includes(subTopic.id));
  const completion = Math.min(100, Math.max(0, topic.progress));

  const getLessonStats = (subTopic: SubTopic) => subTopic.gameStageIds.reduce(
    (stats, stageId) => {
      const stage = subTopic.stages.find(item => item.id === stageId);
      if (!stage) return stats;
      const baseXp = BASE_XP_BY_GAME_TYPE[stage.type];
      return {
        questions: stats.questions + stage.questionCount,
        xp: stats.xp + stage.questionCount * baseXp
      };
    },
    { questions: 0, xp: 0 }
  );

  const toggleSubTopic = (subTopicId: string) => {
    playSelect();
    setSelectedIds(current =>
      current.includes(subTopicId)
        ? current.filter(id => id !== subTopicId)
        : [...current, subTopicId]
    );
  };

  const handleClose = () => {
    playSelect();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm animate-pop-in"
      onMouseDown={event => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-detail-title"
        className="max-h-[min(88vh,760px)] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-white bg-gradient-to-br from-white via-emerald-50/60 to-sky-50/70 p-5 shadow-2xl shadow-slate-950/20 md:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
              {topic.level} · {subTopics.length} chuyên đề
            </span>
            <h2 id="topic-detail-title" className="text-2xl font-black text-slate-800 md:text-3xl">{topic.title}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">{topic.description}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng lựa chọn chủ đề"
            className="rounded-2xl border-b-4 border-slate-300 bg-white p-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50 active:translate-y-1 active:border-b-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <section aria-label="Tiến độ chủ đề" className="mb-6 rounded-2xl border-2 border-white bg-white/85 p-4 shadow-md shadow-emerald-100/60">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-800">Hành trình của bạn</p>
              <p className="text-xs font-medium text-slate-500">{completion}% hoàn thành chủ đề</p>
            </div>
            <span className="text-lg font-black text-emerald-600">{completion}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Tiến độ hoàn thành chủ đề"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
            className="h-3 overflow-hidden rounded-full bg-emerald-100 shadow-inner"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-[width] duration-700 ease-out"
              style={{ width: `${completion}%` }}
            />
          </div>
        </section>

        <div className="space-y-3">
          <div className="mb-1">
            <h3 className="font-black text-slate-700">Lộ trình bài học</h3>
            <p className="text-xs font-medium text-slate-500">Chọn một hoặc nhiều bài để học lý thuyết hoặc luyện tập.</p>
          </div>
          {subTopics.map((subTopic, index) => {
            const isSelected = selectedIds.includes(subTopic.id);
            const isCompleted = subTopic.isMastered;
            const { questions, xp } = getLessonStats(subTopic);

            return (
              <button
                type="button"
                key={subTopic.id}
                aria-pressed={isSelected}
                onClick={() => toggleSubTopic(subTopic.id)}
                className={`group flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 p-3.5 text-left transition-all hover:translate-x-1 active:translate-y-1 active:border-b-0 sm:gap-4 sm:p-4 ${
                  isSelected
                    ? 'border-emerald-300 border-b-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                    : 'border-slate-100 border-b-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/60'
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black ${
                  isSelected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black text-slate-800">Bài {String(index + 1).padStart(2, '0')} · {subTopic.title}</span>
                  <span className="mt-0.5 block text-xs font-medium text-slate-500">{subTopic.description}</span>
                  {isCompleted && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 sm:text-[11px]">
                      <Check className="h-3 w-3" /> Đã hoàn thành
                    </span>
                  )}
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700 sm:text-[11px]">
                      {questions} câu hỏi
                    </span>
                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700 sm:text-[11px]">
                      +{xp} XP
                    </span>
                  </span>
                </span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                  isSelected ? 'bg-emerald-500 text-white' : 'text-slate-300 group-hover:translate-x-1 group-hover:text-sky-500'
                }`}>
                  {isSelected ? <Check className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={selectedSubTopics.length === 0 || loading}
            onClick={() => {
              playSelect();
              onChooseTheory(selectedSubTopics);
            }}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-b-4 border-indigo-700 bg-gradient-to-b from-indigo-500 to-indigo-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-indigo-300 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookOpen className="h-5 w-5" /> Học lý thuyết
          </button>
          <button
            type="button"
            disabled={selectedSubTopics.length === 0 || loading}
            onClick={() => {
              playSelect();
              onStartPractice(selectedSubTopics);
            }}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-b from-emerald-500 to-teal-500 px-5 py-3 font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-emerald-300 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Gamepad2 className="h-5 w-5" /> {loading ? 'Đang tải bài tập...' : 'Luyện tập Game'}
          </button>
        </div>
      </section>
    </div>
  );
}
