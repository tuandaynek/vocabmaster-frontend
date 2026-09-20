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
      ? "bg-emerald-100 text-emerald-700"
      : status === "Cần ôn"
        ? "bg-amber-100 text-amber-700"
        : "bg-sky-100 text-sky-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">{word}</h2>
            <AudioButton text={word} />
            {item.global_words?.ipa && (
              <span className="text-sm text-slate-500">/{item.global_words.ipa}/</span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles}`}>
              {status}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {item.global_words?.pos && <span className="font-medium text-indigo-600">{item.global_words.pos}</span>}
            {item.global_words?.word_type && <span>• {item.global_words.word_type}</span>}
            {item.next_review && (
              <span>
                • Ôn lại: {new Date(item.next_review).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {isDeleting ? "Đang xoá..." : "Xoá"}
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
        <p className="text-xs font-semibold uppercase text-indigo-600">Nghĩa tiếng Việt</p>
        <p className="mt-0.5 text-base font-bold text-slate-800">{meaning}</p>
      </div>

      {item.context_sentence && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="text-xs font-medium text-slate-400">Ngữ cảnh ghi nhớ:</p>
          <p className="mt-0.5 italic">“{item.context_sentence}”</p>
        </div>
      )}

      {(collocations.length > 0 || wordFamily.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3">
          {collocations.length > 0 && (
            <div className="min-w-[200px] flex-1">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
                <BookOpen className="h-3 w-3" /> Collocations
              </p>
              <div className="mt-1 space-y-1">
                {collocations.slice(0, 2).map((col: any, idx: number) => (
                  <div key={idx} className="text-xs text-slate-700">
                    <span className="font-medium">{col.phrase}</span>: <span className="text-slate-500">{col.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wordFamily.length > 0 && (
            <div className="min-w-[200px] flex-1">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase text-slate-400">
                <Layers className="h-3 w-3" /> Họ từ
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {wordFamily.slice(0, 3).map((wf: any, idx: number) => (
                  <span key={idx} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                    <strong>{wf.word}</strong> ({wf.pos})
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