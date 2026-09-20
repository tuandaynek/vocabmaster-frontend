import { useMemo } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VocabListItem } from "../types";
import { WordResultCard } from "./WordResultCard";

interface ResultsWorkspaceProps {
  extractedList: VocabListItem[];
  onToggleAll: () => void;
  onToggle: (index: number) => void;
  onSave: () => void;
}

export function ResultsWorkspace({
  extractedList,
  onToggleAll,
  onToggle,
  onSave,
}: ResultsWorkspaceProps) {
  const selectedCount = useMemo(
    () => extractedList.filter((item) => item.selected).length,
    [extractedList],
  );
  const allSelected = extractedList.length > 0 && selectedCount === extractedList.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Result workspace
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Kết quả trích xuất</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Đã chọn {selectedCount}/{extractedList.length} từ
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleAll}
            className="rounded-lg bg-white"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {extractedList.map((item, index) => (
          <WordResultCard
            key={`${item.word}-${index}`}
            item={item}
            index={index}
            onToggle={() => onToggle(index)}
          />
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={onSave}
          disabled={!selectedCount}
          className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Check className="h-4 w-4" />
          Lưu các từ đã chọn
        </Button>
      </div>
    </section>
  );
}