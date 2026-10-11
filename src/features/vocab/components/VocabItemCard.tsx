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
      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      : status === "Cần ôn"
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        : "bg-sky-500/10 text-sky-400 border border-sky-500/20";

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl transition hover:border-slate-700/80 hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-white tracking-tight">{word}</h2>
            <AudioButton text={word} />
            {item.global_words?.ipa && (
              <span className="text-sm font-medium text-slate-400">{item.global_words.ipa}</span>
            )}
            <span className={`rounded-xl px-3 py-1 text-xs font-bold ${statusStyles}`}>
              {status}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-slate-400 font-medium">
            {item.global_words?.pos && <span className="text-indigo-400">{item.global_words.pos}</span>}
            {item.global_words?.pos && item.global_words?.word_type && <span>•</span>}
            {item.global_words?.word_type && <span>{item.global_words.word_type}</span>}
            {item.next_review && (
              <>
                <span>•</span>
                <span>
                  Ôn lại: <strong className="text-slate-200">{new Date(item.next_review).toLocaleDateString("vi-VN", {
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
          onClick={() => onDelete(item.id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {isDeleting ? "Đang xoá..." : "Xoá"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Nghĩa tiếng Việt</p>
        <p className="text-base font-bold text-slate-100">{meaning}</p>
      </div>

      {item.context_sentence && (
        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-sm text-slate-300">
          <p className="text-xs font-semibold text-slate-400 mb-1">Ngữ cảnh ghi nhớ:</p>
          <p className="italic text-slate-300 leading-relaxed">&ldquo;{item.context_sentence}&rdquo;</p>
        </div>
      )}

      {(collocations.length > 0 || wordFamily.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-800 pt-4">
          {collocations.length > 0 && (
            <div className="min-w-[220px] flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> Collocations
              </p>
              <div className="space-y-1.5">
                {collocations.slice(0, 2).map((col: any, idx: number) => (
                  <div key={idx} className="text-xs text-slate-300">
                    <span className="font-bold text-white">{col.phrase}</span>: <span className="text-slate-400">{col.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wordFamily.length > 0 && (
            <div className="min-w-[220px] flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> Họ từ
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wordFamily.slice(0, 3).map((wf: any, idx: number) => (
                  <span key={idx} className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300">
                    <strong className="text-white">{wf.word}</strong> <span className="text-slate-400">({wf.pos})</span>
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