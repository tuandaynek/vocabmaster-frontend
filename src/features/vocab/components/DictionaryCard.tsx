import { CheckSquare } from "lucide-react";
import { AudioButton } from "@/components/function/AudioButton";
import type { GlobalWordInfo } from "../types";

interface DictionaryCardProps {
  item: GlobalWordInfo;
  isSelected: boolean;
  onToggleSelect: (item: GlobalWordInfo) => void;
}

export function DictionaryCard({ item, isSelected, onToggleSelect }: DictionaryCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{item.word}</h2>
              <AudioButton text={item.word} />
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
              {item.pos && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700">
                  {item.pos}
                </span>
              )}
              {item.word_type && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.word_type}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleSelect(item)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isSelected
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <CheckSquare className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <p className="text-xs font-medium uppercase text-violet-600">Nghĩa tiếng Việt</p>
          <p className="mt-1 text-sm font-bold text-violet-950">
            {item.meaning || "Chưa cập nhật nghĩa"}
          </p>
        </div>
      </div>
    </div>
  );
}
