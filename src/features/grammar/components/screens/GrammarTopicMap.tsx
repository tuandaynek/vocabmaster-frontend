import { BookOpen, Lock, Play, RotateCcw, Trophy } from 'lucide-react';
import type { GrammarTopic } from '../../types/grammarData';

interface GrammarTopicMapProps {
  topics: GrammarTopic[];
  loading: boolean;
  dataError: string | null;
  actionError: string | null;
  onRetry: () => void;
  onSelectTopic: (topic: GrammarTopic) => void;
}

export default function GrammarTopicMap({
  topics,
  loading,
  dataError,
  actionError,
  onRetry,
  onSelectTopic,
}: GrammarTopicMapProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-800">
          <BookOpen className="h-5 w-5 text-emerald-600" /> Bản đồ Chủ đề (Grammar Topics)
        </h3>
        <span className="rounded-2xl border-2 border-slate-100 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
          Hoàn thành: {topics.filter(topic => topic.progress === 100).length}/{topics.length} Topics
        </span>
      </div>

      {dataError && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
          {dataError}
          <button type="button" onClick={onRetry} className="ml-3 underline">
            Thử lại
          </button>
        </div>
      )}
      {actionError && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
          {actionError}
        </div>
      )}

      {loading ? (
        <div role="status" className="rounded-3xl border-2 border-white bg-white/90 p-10 text-center font-bold text-slate-500 shadow-sm">
          Đang tải chủ đề ngữ pháp...
        </div>
      ) : topics.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/80 p-10 text-center text-slate-500">
          Chưa có chủ đề ngữ pháp nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {topics.map(topic => (
            <div
              key={topic.id}
              role={topic.isLocked ? undefined : 'button'}
              tabIndex={topic.isLocked ? undefined : 0}
              onClick={topic.isLocked ? undefined : () => onSelectTopic(topic)}
              onKeyDown={event => {
                if (!topic.isLocked && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onSelectTopic(topic);
                }
              }}
              className={`relative flex cursor-pointer flex-col justify-between rounded-3xl border-2 border-b-4 bg-white/90 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                topic.isLocked
                  ? 'cursor-not-allowed border-slate-100 border-b-slate-200 bg-slate-50/50 opacity-60'
                  : 'border-slate-100 border-b-emerald-100 hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200'
              }`}
            >
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${topic.badgeColor}`}>{topic.level}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" /> {topic.subTopics.length} Chuyên đề
                  </span>
                </div>
                <h4 className="mb-1 text-lg font-extrabold text-slate-800">{topic.title}</h4>
                <p className="mb-4 line-clamp-2 text-xs font-medium text-slate-500">{topic.description}</p>
              </div>

              <div>
                <div className="mb-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Tiến độ mastery</span>
                    <span className={topic.progress === 100 ? 'font-black text-emerald-600' : 'text-slate-600'}>{topic.progress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100 p-0.5 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        topic.progress === 100 ? 'bg-emerald-500' : topic.progress > 0 ? 'bg-amber-400' : 'bg-slate-200'
                      }`}
                      style={{ width: `${topic.progress}%` }}
                    />
                  </div>
                </div>

                <span className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 py-3.5 text-sm font-black shadow-sm ${
                  topic.isLocked
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : topic.progress === 100
                      ? 'border-emerald-300 bg-white text-emerald-700'
                      : 'border-emerald-700 bg-emerald-500 text-white shadow-emerald-200'
                }`}>
                  {topic.isLocked
                    ? <><Lock className="h-4 w-4" /> Đã khóa (Hoàn thành bài trước)</>
                    : topic.progress === 100
                      ? <><RotateCcw className="h-4 w-4" /> Ôn tập lại</>
                      : <><Play className="h-4 w-4 fill-current" /> Chọn chuyên đề</>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
