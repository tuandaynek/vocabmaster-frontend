import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpenText, BrainCircuit, Loader2, Search } from "lucide-react";

import { useMyVocab } from "@/features/vocab/hooks/useMyVocab";
import { VocabItemCard } from "@/features/vocab/components/VocabItemCard";
import { FILTER_OPTIONS } from "@/features/vocab/utils/vocabUtils";

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <BookOpenText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Kho từ cá nhân</p>
              <h1 className="text-2xl font-bold">Từ vựng của tôi</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dictionary")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Khám phá từ mới
            </button>
            <button
              onClick={() => navigate("/flashcards")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Bắt đầu ôn Flashcards
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Tổng số từ</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Đang học</p>
            <p className="mt-2 text-3xl font-bold text-sky-600">{stats.learning}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Cần ôn</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{stats.review}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Đã thuộc</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.mastered}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const active = filter === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm md:w-72">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm từ hoặc nghĩa..."
              className="w-full border-0 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải kho từ của bạn...</span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">
              {items.length === 0 ? "Chưa có từ nào trong kho cá nhân" : "Không tìm thấy từ phù hợp"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {items.length === 0
                ? "Hãy thêm từ từ Dictionary hoặc trích xuất từ bằng Vocab Extractor để bắt đầu học."
                : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => navigate("/dictionary")}
                className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Đi đến Dictionary
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <VocabItemCard
                key={item.id}
                item={item}
                isDeleting={deletingId === item.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}