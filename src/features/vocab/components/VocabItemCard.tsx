import { BookOpen, Layers, Loader2, Trash2 } from "lucide-react";
import { AudioButton } from "@/components/function/AudioButton";
import type { UserVocabularyItem } from "../types";
import { getStatusLabel } from "../utils/vocabUtils";

interface VocabItemCardProps {
  item: UserVocabularyItem;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}

export function VocabItemCard({ item, isDeleting, onDelete }: VocabItemCardProps) {
  const word = item.global_words?.word ?? "Unknown word";
  const meaning = item.global_words?.meaning || "Chưa có nghĩa chi tiết";
  const collocations = Array.isArray(item.global_words?.collocations) ? item.global_words.collocations : [];
  const wordFamily = Array.isArray(item.global_words?.word_family) ? item.global_words.word_family : [];

  const status = getStatusLabel(item);
  const statusStyles =
    status === "Đã thuộc"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Cần ôn"
        ? "border border-amber-200 bg-amber-50 text-amber-800"
        : "border border-sky-200 bg-sky-50 text-sky-800";

  return (
    <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{word}</h2>
            <AudioButton
              text={word}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {item.global_words?.ipa && (
              <span className="text-sm font-medium text-slate-500">{item.global_words.ipa}</span>
            )}
            <span className={`rounded-xl px-3 py-1 text-xs font-bold ${statusStyles}`}>
              {status}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            {item.global_words?.pos && <span className="text-sky-700">{item.global_words.pos}</span>}
            {item.global_words?.pos && item.global_words?.word_type && <span>•</span>}
            {item.global_words?.word_type && <span>{item.global_words.word_type}</span>}
            {item.next_review && (
              <>
                <span>•</span>
                <span>
                  Ôn lại:                   <strong className="text-slate-700">{new Date(item.next_review).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}</strong>
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-b-4 border-rose-700 bg-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-rose-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {isDeleting ? "Đang xoá..." : "Xoá"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Nghĩa tiếng Việt</p>
        <p className="text-base font-bold text-slate-800">{meaning}</p>
      </div>

      {item.context_sentence && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="mb-1 text-xs font-semibold text-slate-600">Ngữ cảnh ghi nhớ:</p>
          <p className="italic leading-relaxed text-slate-600">&ldquo;{item.context_sentence}&rdquo;</p>
        </div>
      )}

      {(collocations.length > 0 || wordFamily.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-6 border-t-2 border-slate-100 pt-4">
          {collocations.length > 0 && (
            <div className="min-w-[220px] flex-1">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <BookOpen className="h-3.5 w-3.5 text-sky-600" /> Collocations
              </p>
              <div className="space-y-1.5">
                {collocations.slice(0, 2).map((col, idx) => (
                  <div key={idx} className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800">{col.phrase}</span>: <span className="text-slate-500">{col.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wordFamily.length > 0 && (
            <div className="min-w-[220px] flex-1">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Layers className="h-3.5 w-3.5 text-emerald-600" /> Họ từ
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wordFamily.slice(0, 3).map((wf, idx) => (
                  <span key={idx} className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                    <strong className="text-slate-800">{wf.word}</strong> <span className="text-slate-500">({wf.pos})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}