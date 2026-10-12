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
    <aside className="sticky top-24 space-y-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5 border-b-2 border-slate-100 pb-3">
        <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
          Bộ lọc từ đơn
        </h2>
      </div>

      <div className="space-y-5">
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Tìm kiếm
          </span>
          <div className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-slate-50 px-3.5 py-3 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm từ hoặc nghĩa..."
              className="w-full border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            POS (Từ loại)
          </span>
          <select
            value={posFilter}
            onChange={(e) => onPosFilterChange(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tất cả POS</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Loại từ
          </span>
          <select
            value={wordTypeFilter}
            onChange={(e) => onWordTypeFilterChange(e.target.value)}
            className="w-full cursor-pointer rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tất cả loại từ</option>
            <option value="academic">Academic</option>
            <option value="daily">Daily</option>
          </select>
        </label>

        <div className="space-y-3 border-t-2 border-slate-100 pt-5">
          <button
            type="button"
            onClick={onSelectVisible}
            disabled={!hasVisibleItems}
            className="w-full rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-2.5 text-sm font-bold text-amber-950 shadow-sm transition-all duration-150 hover:bg-amber-500 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {allVisibleSelected ? "Bỏ chọn trang này" : "Chọn tất cả trang này"}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasSelectedItems}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" /> Xóa lựa chọn
          </button>
        </div>
      </div>
    </aside>
  );
}
