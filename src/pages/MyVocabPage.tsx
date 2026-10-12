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
    <div className="min-h-screen overflow-hidden bg-slate-50 px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/vocab")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
              title="Quay lại Vocab Hub"
              aria-label="Quay lại Vocab Hub"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
              <BookOpenText className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Kho từ cá nhân</span>
              <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-800">Từ vựng của tôi</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/dictionary")}
              className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
            >
              Khám phá từ mới
            </button>
            <button
              type="button"
              onClick={() => navigate("/flashcards")}
              className="inline-flex items-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
            >
              Bắt đầu ôn Flashcards
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng số từ</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-800">{stats.total}</p>
          </div>
          <div className="rounded-3xl border-2 border-sky-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Đang học</p>
            <p className="mt-2 text-4xl font-extrabold text-sky-600">{stats.learning}</p>
          </div>
          <div className="rounded-3xl border-2 border-amber-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Cần ôn</p>
            <p className="mt-2 text-4xl font-extrabold text-amber-600">{stats.review}</p>
          </div>
          <div className="rounded-3xl border-2 border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Đã thuộc</p>
            <p className="mt-2 text-4xl font-extrabold text-emerald-600">{stats.mastered}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const active = filter === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`rounded-2xl border-b-4 px-5 py-2.5 text-sm font-bold transition-all duration-150 active:translate-y-1 active:border-b-0 ${
                    active
                      ? "border-amber-600 bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-500"
                      : "border-2 border-b-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 md:w-80">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ hoặc nghĩa..."
              className="w-full border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-3xl border-2 border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="font-semibold">Đang tải kho từ của bạn...</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {items.length === 0 ? "Chưa có từ nào trong kho cá nhân" : "Không tìm thấy từ phù hợp"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {items.length === 0
                ? "Hãy thêm từ từ Dictionary hoặc trích xuất từ bằng Vocab Extractor để bắt đầu học."
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn."}
            </p>
            {items.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/dictionary")}
                className="mt-6 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
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
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-slate-100 bg-white px-6 py-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}</span> trong tổng số <span className="font-bold text-slate-800">{filteredItems.length}</span> từ
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trước
                  </button>
                  
                  <span className="px-3 text-sm font-bold text-emerald-700">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40"
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