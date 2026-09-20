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
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-violet-600" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Filters
        </h2>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            Tìm kiếm
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm cụm từ, nghĩa..."
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            Phân loại cụm
          </span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="all">Tất cả loại cụm</option>
            <option value="grammatical">Grammatical</option>
            <option value="lexical">Lexical</option>
            <option value="opinion">Opinion</option>
            <option value="frequency">Frequency</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            Topic
          </span>
          <select
            value={topicFilter}
            onChange={(e) => onTopicFilterChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Tất cả Topic</option>
            {CORE_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            Trình độ CEFR
          </span>
          <select
            value={cefrFilter}
            onChange={(e) => onCefrFilterChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Tất cả trình độ</option>
            {CEFR_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onSelectVisible}
            disabled={!hasVisibleItems}
            className="w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
          >
            {allVisibleSelected ? "Đã chọn tất cả visible" : "Chọn tất cả visible"}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasSelectedItems}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Xóa lựa chọn
          </button>
        </div>
      </div>
    </aside>
  );
}
