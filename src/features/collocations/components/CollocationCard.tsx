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
    <div className={`flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-xl ${
      isSelected 
        ? "border-violet-500/80 bg-violet-950/20 shadow-violet-500/10" 
        : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700/80 shadow-black/40"
    }`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <h2 className="text-lg font-black text-white tracking-tight">{item.phrase}</h2>
              <AudioButton text={item.phrase} audioUrl={item.audio_url} />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-indigo-400">
                {item.type}
              </span>
              <span className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-400">
                {item.cefr_level || "A1"}
              </span>
              <span className="rounded-xl bg-slate-800 border border-slate-700/50 px-2.5 py-1 text-slate-300">
                {item.topic}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleSelect(item)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all ${
              isSelected
                ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105"
                : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-white hover:bg-slate-800"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-0.5">
            Cấu trúc đi kèm (Pattern)
          </p>
          <p className="text-sm font-bold text-slate-100">{item.pattern}</p>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-1">Nghĩa tiếng Việt</p>
          <p className="text-sm font-bold text-slate-100">{item.meaning}</p>
        </div>

        {item.base_sentence && (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5 text-xs">
            <p className="font-bold text-slate-300 mb-1">Câu mẫu gốc:</p>
            <p className="italic text-slate-400 leading-relaxed">&ldquo;{item.base_sentence}&rdquo;</p>
          </div>
        )}

        {item.drill_variations?.change_verb?.length ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/30 p-3 text-xs space-y-1.5">
            <p className="flex items-center gap-1.5 font-bold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" /> Drill Variations Preview
            </p>
            <ul className="space-y-1 text-slate-400">
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