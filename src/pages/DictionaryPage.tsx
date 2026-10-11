// DictionaryPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowLeft, Plus, BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { vocabApi } from "@/features/vocab/api/vocabApi";
import { collocationApi } from "@/features/collocations/api/collocationApi";
import type { GlobalWordInfo } from "@/features/vocab/types";
import type { GlobalCollocationItem } from "@/features/collocations/types";
import { DictionaryCard } from "@/features/vocab/components/DictionaryCard";
import { DictionaryFilters } from "@/features/vocab/components/DictionaryFilters";
import { CollocationCard } from "@/features/collocations/components/CollocationCard";
import { CollocationFilters } from "@/features/collocations/components/CollocationFilters";

const PAGE_SIZE = 6;

export type DictionaryTab = "words" | "collocations";
type DictionaryItem = GlobalWordInfo | GlobalCollocationItem;
const isWordItem = (item: DictionaryItem): item is GlobalWordInfo => "word" in item;

export default function DictionaryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DictionaryTab>("words");
  
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Filters cho Words
  const [posFilter, setPosFilter] = useState("all");
  const [wordTypeFilter, setWordTypeFilter] = useState("all");

  // Filters cho Collocations
  const [collocationTypeFilter, setCollocationTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [cefrFilter, setCefrFilter] = useState("all");

  const [selectedMap, setSelectedMap] = useState<Record<string, DictionaryItem>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const selectedIds = useMemo(() => Object.keys(selectedMap), [selectedMap]);
  const selectedItems = useMemo(() => Object.values(selectedMap), [selectedMap]);

  // Reset tab & selection
  const handleTabChange = (tab: DictionaryTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedMap({});
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Fetch API duy nhất dựa trên Active Tab
  const fetchDictionary = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "words") {
        const response = await vocabApi.getGlobalDictionary({
          search,
          pos: posFilter,
          wordType: wordTypeFilter,
          page: currentPage,
          limit: PAGE_SIZE,
        });
        setItems(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      } else {
        const response = await collocationApi.getGlobalList({
          search,
          type: collocationTypeFilter,
          topic: topicFilter,
          cefr: cefrFilter,
          page: currentPage,
          limit: PAGE_SIZE,
        });
        setItems(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to load dictionary:", error);
      setItems([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [search, posFilter, wordTypeFilter, collocationTypeFilter, topicFilter, cefrFilter, currentPage, activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDictionary();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [fetchDictionary]);

  const visibleIds = useMemo(() => items.map((item) => item.id), [items]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelected = (item: DictionaryItem) => {
    setSelectedMap((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return { ...prev, [item.id]: item };
    });
  };

  const selectVisibleItems = () => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      visibleIds.forEach((id) => {
        const item = items.find((entry) => entry.id === id);
        if (item) next[id] = item;
      });
      return next;
    });
  };

  const clearSelection = () => setSelectedMap({});

  const handleAddSelectedToPersonalDictionary = async () => {
    if (selectedItems.length === 0) return;

    try {
      if (activeTab === "words") {
        const payload = selectedItems.filter(isWordItem).map((item) => ({
          word: item.word.trim(),
          context_sentence: item.context_sentences?.[0]?.trim() || item.word,
        }));
        const response = await vocabApi.save({ selectedWords: payload });
        toast.success(`Đã thêm ${response?.savedCount ?? payload.length} từ vào từ điển cá nhân.`);
      } else {
        // Lưu Collocations
        console.log("Selected Collocations to save:", selectedItems);
        const payload = selectedItems.filter((item): item is GlobalCollocationItem => !isWordItem(item)).map((item) => ({
          id: item.id,
          base_sentence: item.base_sentence?.trim() || "",
        }));
        await collocationApi.download(payload);
        toast.success(`Đã thêm ${payload.length} cụm từ vào danh sách ôn tập.`);
      }
      setSelectedMap({});
    } catch (error: unknown) {
      console.error("Failed to save:", error);
      toast.error(error instanceof Error ? error.message : "Không thể lưu vào từ điển cá nhân.");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hiệu ứng ánh sáng nền Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/vocab")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/50 text-slate-300 transition hover:bg-slate-800 hover:text-white shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Global Knowledge
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Từ điển toàn cục
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSelectedToPersonalDictionary}
            disabled={selectedItems.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "words" ? "Thêm từ đã chọn" : "Thêm cụm từ đã chọn"} ({selectedItems.length})
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 border-b border-slate-800/80 pb-4">
          <button
            type="button"
            onClick={() => handleTabChange("words")}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "words"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-105"
                : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Từ đơn (Words)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("collocations")}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "collocations"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-105"
                : "bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Cụm từ (Collocations)
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
          {activeTab === "words" ? (
            <DictionaryFilters
              search={search}
              onSearchChange={handleSearchChange}
              posFilter={posFilter}
              onPosFilterChange={(v) => { setPosFilter(v); setCurrentPage(1); }}
              wordTypeFilter={wordTypeFilter}
              onWordTypeFilterChange={(v) => { setWordTypeFilter(v); setCurrentPage(1); }}
              onSelectVisible={selectVisibleItems}
              onClearSelection={clearSelection}
              allVisibleSelected={allVisibleSelected}
              hasVisibleItems={visibleIds.length > 0}
              hasSelectedItems={selectedIds.length > 0}
            />
          ) : (
            <CollocationFilters
              search={search}
              onSearchChange={handleSearchChange}
              typeFilter={collocationTypeFilter}
              onTypeFilterChange={(v) => { setCollocationTypeFilter(v); setCurrentPage(1); }}
              topicFilter={topicFilter}
              onTopicFilterChange={(v) => { setTopicFilter(v); setCurrentPage(1); }}
              cefrFilter={cefrFilter}
              onCefrFilterChange={(v) => { setCefrFilter(v); setCurrentPage(1); }}
              onSelectVisible={selectVisibleItems}
              onClearSelection={clearSelection}
              allVisibleSelected={allVisibleSelected}
              hasVisibleItems={visibleIds.length > 0}
              hasSelectedItems={selectedIds.length > 0}
            />
          )}

          <main className="relative min-h-[400px]">
            <div className={`transition-all duration-300 ${loading ? "pointer-events-none opacity-40 blur-[2px]" : ""}`}>
              {items.length === 0 && !loading ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center shadow-xl backdrop-blur-md">
                  <p className="text-lg font-semibold text-slate-300">Không tìm thấy kết quả phù hợp.</p>
                  <p className="mt-2 text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-1 xl:grid-cols-2">
                    {items.map((item) =>
                      activeTab === "words" && isWordItem(item) ? (
                        <DictionaryCard
                          key={item.id}
                          item={item}
                          isSelected={selectedIds.includes(item.id)}
                          onToggleSelect={toggleSelected}
                        />
                      ) : !isWordItem(item) ? (
                        <CollocationCard
                          key={item.id}
                          item={item}
                          isSelected={selectedIds.includes(item.id)}
                          onToggleSelect={toggleSelected}
                        />
                      ) : null,
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="mt-8 flex items-center justify-between gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/50 px-6 py-4 shadow-xl backdrop-blur-xl">
                    <div className="text-sm font-medium text-slate-400">
                      Trang <span className="text-white font-bold">{currentPage}</span> / {totalPages} · <span className="text-white font-bold">{totalItems}</span> {activeTab === "words" ? "từ" : "cụm từ"}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-3">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                  <p className="text-sm font-bold text-violet-400 tracking-wide">Đang tải dữ liệu...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}