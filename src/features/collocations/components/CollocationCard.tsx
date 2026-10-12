import { CheckSquare, Sparkles } from "lucide-react";
import { AudioButton } from "@/components/function/AudioButton";
import type { GlobalCollocationItem } from "../types";

interface CollocationCardProps {
  item: GlobalCollocationItem;
  isSelected: boolean;
  onToggleSelect: (item: GlobalCollocationItem) => void;
}

export function CollocationCard({
  item,
  isSelected,
  onToggleSelect,
}: CollocationCardProps) {
  return (
    <div className={`flex flex-col justify-between rounded-3xl border-2 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
      isSelected
        ? "border-emerald-300 bg-white"
        : "border-slate-100 hover:border-emerald-200"
    }`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-800">{item.phrase}</h2>
              <AudioButton
                text={item.phrase}
                audioUrl={item.audio_url}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">
                {item.type}
              </span>
              <span className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">
                {item.cefr_level || "A1"}
              </span>
              <span className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700">
                {item.topic}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSelect(item)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 transition-all duration-150 active:translate-y-1 active:border-b-0 ${
              isSelected
                ? "border-emerald-700 bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
            aria-label={isSelected ? "Bỏ chọn cụm từ" : "Chọn cụm từ"}
            aria-pressed={isSelected}
          >
            <CheckSquare className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3.5">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">
            Cấu trúc đi kèm (Pattern)
          </p>
          <p className="text-sm font-bold text-slate-800">{item.pattern}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Nghĩa tiếng Việt</p>
          <p className="text-sm font-bold text-slate-800">{item.meaning}</p>
        </div>

        {item.base_sentence && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <p className="mb-1 font-bold text-slate-700">Câu mẫu gốc:</p>
            <p className="italic leading-relaxed text-slate-500">&ldquo;{item.base_sentence}&rdquo;</p>
          </div>
        )}

        {item.drill_variations?.change_verb?.length ? (
          <div className="space-y-1.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs">
            <p className="flex items-center gap-1.5 font-bold text-amber-700">
              <Sparkles className="h-3.5 w-3.5" /> Drill Variations Preview
            </p>
            <ul className="space-y-1 text-slate-600">
              {item.drill_variations.change_verb.slice(0, 2).map((sentence, idx) => (
                <li key={idx} className="truncate">
                  • {sentence}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}