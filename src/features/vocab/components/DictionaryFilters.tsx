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
    <aside className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl space-y-6 sticky top-24">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <SlidersHorizontal className="h-4 w-4 text-violet-400" />
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Bộ lọc từ đơn
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
              placeholder="Tìm từ hoặc nghĩa..."
              className="w-full border-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            POS (Từ loại)
          </span>
          <select
            value={posFilter}
            onChange={(e) => onPosFilterChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-800/40 px-3.5 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-violet-500 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">Tất cả POS</option>
            <option value="noun" className="bg-slate-900 text-slate-300">Noun</option>
            <option value="verb" className="bg-slate-900 text-slate-300">Verb</option>
            <option value="adjective" className="bg-slate-900 text-slate-300">Adjective</option>
            <option value="adverb" className="bg-slate-900 text-slate-300">Adverb</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Loại từ
          </span>
          <select
            value={wordTypeFilter}
            onChange={(e) => onWordTypeFilterChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-700/60 bg-slate-800/40 px-3.5 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-violet-500 focus:bg-slate-800 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">Tất cả loại từ</option>
            <option value="academic" className="bg-slate-900 text-slate-300">Academic</option>
            <option value="daily" className="bg-slate-900 text-slate-300">Daily</option>
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
