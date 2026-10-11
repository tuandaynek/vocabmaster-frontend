import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpenText, BrainCircuit, Loader2, Search } from "lucide-react";

import { useMyVocab } from "@/features/vocab/hooks/useMyVocab";
import { VocabItemCard } from "@/features/vocab/components/VocabItemCard";
import { FILTER_OPTIONS } from "@/features/vocab/utils/vocabUtils";
import { useEffect, useState } from "react";

export default function MyVocabPage() {
  const navigate = useNavigate();
  const {
    items,
    filteredItems,
    filter,
    setFilter,
    search,
    setSearch,
    loading,
    deletingId,
    handleDelete,
    stats,
  } = useMyVocab();

  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Số lượng vocab hiển thị trên 1 trang

  // Reset về trang 1 khi đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // Tính toán items cho trang hiện tại
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hiệu ứng ánh sáng nền Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-6xl space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/vocab")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/50 text-slate-300 transition hover:bg-slate-800 hover:text-white shadow-sm shrink-0"
              title="Quay lại Vocab Hub"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner shrink-0">
              <BookOpenText className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Kho từ cá nhân</span>
              <h1 className="text-3xl font-black tracking-tight text-white mt-0.5">Từ vựng của tôi</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dictionary")}
              className="rounded-2xl border border-slate-700/60 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white shadow-sm"
            >
              Khám phá từ mới
            </button>
            <button
              onClick={() => navigate("/flashcards")}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              Bắt đầu ôn Flashcards
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl transition hover:border-slate-700">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng số từ</p>
            <p className="mt-2 text-4xl font-black text-white">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-sky-500/20 bg-sky-950/20 p-6 backdrop-blur-xl shadow-xl transition hover:border-sky-500/40">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-400">Đang học</p>
            <p className="mt-2 text-4xl font-black text-sky-400">{stats.learning}</p>
          </div>
          <div className="rounded-3xl border border-amber-500/20 bg-amber-950/20 p-6 backdrop-blur-xl shadow-xl transition hover:border-amber-500/40">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Cần ôn</p>
            <p className="mt-2 text-4xl font-black text-amber-400">{stats.review}</p>
          </div>
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-xl shadow-xl transition hover:border-emerald-500/40">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Đã thuộc</p>
            <p className="mt-2 text-4xl font-black text-emerald-400">{stats.mastered}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-xl shadow-xl md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const active = filter === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                      : "bg-slate-800/50 text-slate-400 border border-slate-700/60 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5 text-sm md:w-80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ hoặc nghĩa..."
              className="w-full border-0 bg-transparent text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="font-semibold">Đang tải kho từ của bạn...</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 shadow-inner">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">
              {items.length === 0 ? "Chưa có từ nào trong kho cá nhân" : "Không tìm thấy từ phù hợp"}
            </h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
              {items.length === 0
                ? "Hãy thêm từ từ Dictionary hoặc trích xuất từ bằng Vocab Extractor để bắt đầu học."
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn."}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => navigate("/dictionary")}
                className="mt-6 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
              >
                Đi đến Dictionary
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid 2 cột giúp không gian thông thoáng & vừa tầm mắt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedItems.map((item) => (
                <VocabItemCard
                  key={item.id}
                  item={item}
                  isDeleting={deletingId === item.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/50 px-6 py-4 backdrop-blur-xl shadow-xl">
                <p className="text-sm font-medium text-slate-400">
                  Hiển thị <span className="font-bold text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}</span> trong tổng số <span className="font-bold text-white">{filteredItems.length}</span> từ
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  
                  <span className="px-3 text-sm font-bold text-indigo-400">
                    {currentPage} / {totalPages}
                  </span>

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
            )}
          </div>
        )}
      </div>
    </div>
  );
}