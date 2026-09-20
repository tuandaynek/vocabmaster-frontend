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

const PAGE_SIZE = 9;

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
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-600">
                Global Knowledge
              </p>
              <h1 className="text-3xl font-bold">Từ điển toàn cục</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSelectedToPersonalDictionary}
            disabled={selectedItems.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "words" ? "Thêm từ đã chọn" : "Thêm cụm từ đã chọn"} ({selectedItems.length})
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => handleTabChange("words")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "words"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Từ đơn (Words)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("collocations")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "collocations"
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Cụm từ (Collocations)
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
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

          <main className="relative">
            <div className={loading ? "pointer-events-none opacity-55 blur-[1px]" : ""}>
              {items.length === 0 && !loading ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-lg font-semibold text-slate-700">Không tìm thấy kết quả phù hợp.</p>
                  <p className="mt-2 text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="text-sm text-slate-600">
                      Trang {currentPage} / {totalPages} · {totalItems} {activeTab === "words" ? "từ" : "cụm từ"}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="rounded-2xl border border-violet-200 bg-white/90 p-6 shadow-2xl backdrop-blur-sm">
                  <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
                  <p className="text-sm font-semibold text-violet-700">Đang tải dữ liệu...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}