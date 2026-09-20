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
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{item.phrase}</h2>
              <AudioButton text={item.phrase} audioUrl={item.audio_url} />
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">
                {item.type}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                {item.cefr_level || "A1"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                {item.topic}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSelect(item)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
              isSelected
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-2.5">
          <p className="text-[11px] font-semibold uppercase text-indigo-600">
            Cấu trúc đi kèm (Pattern)
          </p>
          <p className="mt-0.5 text-xs font-bold text-indigo-950">{item.pattern}</p>
        </div>

        <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <p className="text-xs font-medium uppercase text-violet-600">Nghĩa tiếng Việt</p>
          <p className="mt-1 text-sm font-bold text-violet-950">{item.meaning}</p>
        </div>

        {item.base_sentence && (
          <div className="mb-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Câu mẫu gốc:</p>
            <p className="mt-0.5 italic text-slate-600">"{item.base_sentence}"</p>
          </div>
        )}

        {item.drill_variations?.change_verb?.length ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-xs">
            <p className="flex items-center gap-1 font-semibold text-slate-500">
              <Sparkles className="h-3 w-3 text-indigo-500" /> Drill Variations Preview
            </p>
            <ul className="mt-1 space-y-1 text-slate-600">
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
