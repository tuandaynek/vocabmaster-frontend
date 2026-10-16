import { useMemo, useState } from "react";
import { Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VocabListItem } from "../types";
import { WordResultCard } from "./WordResultCard";
import { useRating } from "@/contexts/useRating";

interface ResultsWorkspaceProps {
  extractedList: VocabListItem[];
  onToggleAll: () => void;
  onToggle: (index: number) => void;
  onSave: () => void | Promise<void>;
}

export function ResultsWorkspace({
  extractedList,
  onToggleAll,
  onToggle,
  onSave,
}: ResultsWorkspaceProps) {
  const { openRating } = useRating();

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const selectedCount = useMemo(
    () => extractedList.filter((item) => item.selected).length,
    [extractedList]
  );
  const allSelected =
    extractedList.length > 0 && selectedCount === extractedList.length;

  // Hàm xử lý lưu dữ liệu, chống click liên tục
  const handleSave = async () => {
    if (!onSave || isSaving || isSaved) return;

    setIsSaving(true);
    try {
      await onSave();
      setIsSaved(true);

      openRating({
        feature: "Vocab Extractor",
        title: "Đánh giá trích xuất từ vựng",
        description: "Bạn cảm thấy kết quả trích xuất từ vựng này thế nào?",
        fastComments: [
          "Tốc độ phản hồi chậm",
          "Vẫn còn nhiều từ không chính xác",
          "Kết quả trích xuất tốt",
          "Rất chính xác và hữu ích",
        ],
        onClose: () => {
          setTimeout(() => setIsSaved(false), 2500);
        },
      });
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  return (
  <section className="space-y-6 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm sm:p-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          Result workspace
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-800">
          Kết quả trích xuất
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-500">
          Đã chọn <span className="font-bold text-slate-800">{selectedCount}</span>/{extractedList.length} từ
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleAll}
          disabled={isSaving}
          className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-700 transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      {extractedList.map((item, index) => (
        <WordResultCard
          key={`${item.word}-${index}`}
          item={item}
          index={index}
          onToggle={() => onToggle(index)}
        />
      ))}
    </div>

    <div className="mt-6 flex justify-end">
      <Button
        type="button"
        onClick={handleSave}
        disabled={!selectedCount || !onSave || isSaving || isSaved}
        className={`rounded-2xl border-b-4 px-6 py-3.5 font-bold text-white shadow-sm transition-all duration-150 active:translate-y-1 active:border-b-0 ${
          isSaved
            ? "cursor-default border-emerald-700 bg-emerald-500 hover:bg-emerald-500"
            : "border-emerald-700 bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Đang lưu các từ đã chọn...
          </>
        ) : isSaved ? (
          <>
            <CheckCheck className="h-4 w-4 text-white mr-2" />
            Đã lưu thành công!
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Lưu các từ đã chọn ({selectedCount})
          </>
        )}
      </Button>
    </div>
  </section>
);
}