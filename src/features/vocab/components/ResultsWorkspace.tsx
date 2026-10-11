import { useMemo, useState } from "react";
import { Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VocabListItem } from "../types";
import { WordResultCard } from "./WordResultCard";
import {  useRating } from "@/contexts/RatingContext";

interface ResultsWorkspaceProps {
  extractedList: VocabListItem[];
  onToggleAll: () => void;
  onToggle: (index: number) => void;
  onSave: () => void | Promise<void>; // Hỗ trợ cả async hàm
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

    try {
      setIsSaving(true);
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
          // Reset trạng thái báo thành công sau 2.5s (nếu user vẫn ở trang này)
          setTimeout(() => {
            setIsSaved(false);
          }, 2500);
        }
      });

    } catch (error) {
      console.error("Lỗi khi lưu từ vựng:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
  <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-8 space-y-6 shadow-2xl">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">
          Result workspace
        </p>
        <h2 className="mt-1 text-2xl font-black text-white tracking-tight">
          Kết quả trích xuất
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-400">
          Đã chọn <span className="text-white font-bold">{selectedCount}</span>/{extractedList.length} từ
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleAll}
          disabled={isSaving}
          className="rounded-2xl border-slate-700/60 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
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
        className={`rounded-2xl px-6 py-3 font-bold text-white transition-all duration-200 ${
          isSaved
            ? "bg-emerald-600 hover:bg-emerald-600 cursor-default shadow-lg shadow-emerald-600/30"
            : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/30"
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