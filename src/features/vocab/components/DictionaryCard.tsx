import { CheckSquare } from "lucide-react";
import { AudioButton } from "@/components/function/AudioButton";
import type { GlobalWordInfo } from "../types";

interface DictionaryCardProps {
  item: GlobalWordInfo;
  isSelected: boolean;
  onToggleSelect: (item: GlobalWordInfo) => void;
}

export function DictionaryCard({
  item,
  isSelected,
  onToggleSelect,
}: DictionaryCardProps) {
  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-xl ${
        isSelected
          ? "border-violet-500/80 bg-violet-950/20 shadow-violet-500/10"
          : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700/80 shadow-black/40"
      }`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <h2 className="text-xl font-black text-white tracking-tight">
                {item.word}
              </h2>
              <span className="text-sm font-mono font-medium text-slate-400">
                {item.ipa}
              </span>
              <AudioButton text={item.word} />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {item.pos && (
                <span className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-violet-400">
                  {item.pos}
                </span>
              )}
              {item.word_type && (
                <span className="rounded-xl bg-slate-800 border border-slate-700/50 px-2.5 py-1 text-slate-300">
                  {item.word_type}
                </span>
              )}
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

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 shadow-inner">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-1">
            Nghĩa tiếng Việt
          </p>
          <p className="text-base font-bold text-slate-100">
            {item.meaning || "Chưa cập nhật nghĩa"}
          </p>
        </div>
      </div>
    </div>
  );
}
