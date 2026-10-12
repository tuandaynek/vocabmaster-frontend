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
      className={`flex flex-col justify-between rounded-3xl border-2 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        isSelected
          ? "border-emerald-300 bg-white"
          : "border-slate-100 bg-white hover:border-emerald-200"
      }`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                {item.word}
              </h2>
              <span className="text-sm font-mono font-medium text-slate-500">
                {item.ipa}
              </span>
              <AudioButton
                text={item.word}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {item.pos && (
                <span className="rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">
                  {item.pos}
                </span>
              )}
              {item.word_type && (
                <span className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">
                  {item.word_type}
                </span>
              )}
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
            aria-label={isSelected ? "Bỏ chọn từ" : "Chọn từ"}
            aria-pressed={isSelected}
          >
            <CheckSquare className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Nghĩa tiếng Việt
          </p>
          <p className="text-base font-bold text-slate-800">
            {item.meaning || "Chưa cập nhật nghĩa"}
          </p>
        </div>
      </div>
    </div>
  );
}
