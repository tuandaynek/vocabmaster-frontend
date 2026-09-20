import { Search, SlidersHorizontal, Trash2 } from "lucide-react";

interface DictionaryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  posFilter: string;
  onPosFilterChange: (value: string) => void;
  wordTypeFilter: string;
  onWordTypeFilterChange: (value: string) => void;
  onSelectVisible: () => void;
  onClearSelection: () => void;
  allVisibleSelected: boolean;
  hasVisibleItems: boolean;
  hasSelectedItems: boolean;
}

export function DictionaryFilters({
  search,
  onSearchChange,
  posFilter,
  onPosFilterChange,
  wordTypeFilter,
  onWordTypeFilterChange,
  onSelectVisible,
  onClearSelection,
  allVisibleSelected,
  hasVisibleItems,
  hasSelectedItems,
}: DictionaryFiltersProps) {
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
              placeholder="Tìm từ hoặc nghĩa..."
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            POS
          </span>
          <select
            value={posFilter}
            onChange={(e) => onPosFilterChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="all">Tất cả POS</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
            Loại từ
          </span>
          <select
            value={wordTypeFilter}
            onChange={(e) => onWordTypeFilterChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="all">Tất cả loại từ</option>
            <option value="academic">Academic</option>
            <option value="daily">Daily</option>
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
