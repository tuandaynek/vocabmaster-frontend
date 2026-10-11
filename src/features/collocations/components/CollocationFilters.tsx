import { Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { CEFR_LEVELS, CORE_TOPICS } from "../types";

interface CollocationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  topicFilter: string;
  onTopicFilterChange: (value: string) => void;
  cefrFilter: string;
  onCefrFilterChange: (value: string) => void;
  onSelectVisible: () => void;
  onClearSelection: () => void;
  allVisibleSelected: boolean;
  hasVisibleItems: boolean;
  hasSelectedItems: boolean;
}

export function CollocationFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  topicFilter,
  onTopicFilterChange,
  cefrFilter,
  onCefrFilterChange,
  onSelectVisible,
  onClearSelection,
  allVisibleSelected,
  hasVisibleItems,
  hasSelectedItems,
}: CollocationFiltersProps) {
  return (
    <aside className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-6 sticky top-24">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <SlidersHorizontal className="h-4 w-4 text-violet-400" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Bộ lọc cụm từ
        </h2>
      </div>

      <div className="space-y-5">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Tìm kiếm
          </span>
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-800/40 px-3.5 py-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm cụm từ, nghĩa..."
              className="w-full border-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Phân loại cụm
          </span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-800/40 px-3.5 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-violet-500 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">Tất cả loại cụm</option>
            <option value="grammatical" className="bg-slate-900 text-slate-300">Grammatical</option>
            <option value="lexical" className="bg-slate-900 text-slate-300">Lexical</option>
            <option value="opinion" className="bg-slate-900 text-slate-300">Opinion</option>
            <option value="frequency" className="bg-slate-900 text-slate-300">Frequency</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Topic
          </span>
          <select
            value={topicFilter}
            onChange={(e) => onTopicFilterChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-800/40 px-3.5 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-violet-500 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">Tất cả Topic</option>
            {CORE_TOPICS.map((topic) => (
              <option key={topic} value={topic} className="bg-slate-900 text-slate-300">
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Trình độ CEFR
          </span>
          <select
            value={cefrFilter}
            onChange={(e) => onCefrFilterChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-800/40 px-3.5 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-violet-500 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">Tất cả trình độ</option>
            {CEFR_LEVELS.map((level) => (
              <option key={level} value={level} className="bg-slate-900 text-slate-300">
                {level}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3 border-t border-slate-800 pt-5">
          <button
            type="button"
            onClick={onSelectVisible}
            disabled={!hasVisibleItems}
            className="w-full rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allVisibleSelected ? "Bỏ chọn trang này" : "Chọn tất cả trang này"}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasSelectedItems}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" /> Xóa lựa chọn
          </button>
        </div>
      </div>
    </aside>
  );
}
