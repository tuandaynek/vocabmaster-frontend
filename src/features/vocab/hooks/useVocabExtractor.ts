import { useState } from "react";
import { toast } from "sonner";
import { vocabApi } from "../api/vocabApi";
import type { FocusMode, VocabListItem } from "../types";

export function useVocabExtractor() {
  const [passageText, setPassageText] = useState("");
  const [limit, setLimit] = useState(15);
  const [focusMode, setFocusMode] = useState<FocusMode>("IELTS Academic");
  const [mustIncludeWords, setMustIncludeWords] = useState<string[]>([]);
  const [extractedList, setExtractedList] = useState<VocabListItem[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    const value = passageText.trim();
    if (!value) {
      toast.error("Vui lòng nhập đoạn văn trước khi trích xuất từ vựng.");
      return;
    }
    setLoading(true);
    try {
      const response = await vocabApi.extract({
        passage: value,
        limit,
        focusMode,
        mustIncludeWords,
      });
      const data = Array.isArray(response?.data) ? response.data : [];

      setExtractedList(
        data.map((item) => ({
          ...item,
          selected: true,
        })),
      );
      setHasExtracted(true);
    } catch (error) {
      console.error("Vocab extract error:", error);
      toast.error("Không thể trích xuất từ vựng lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const selectedWords = extractedList
      .filter((item) => item.selected)
      .map(({ selected, ...rest }) => rest);

    if (selectedWords.length === 0) {
      toast.error("Vui lòng chọn ít nhất một từ để lưu.");
      return;
    }

    try {
      await vocabApi.save({ selectedWords });
      setExtractedList([]);
      toast.success(`Đã lưu ${selectedWords.length} từ vào VocabMaster.`);
    } catch (error) {
      console.error("Vocab save error:", error);
      toast.error("Không thể lưu danh sách từ vựng lúc này.");
    }
  };

  const toggleAll = () => {
    setExtractedList((prev) => {
      const allSelected = prev.length > 0 && prev.every((entry) => entry.selected);
      return prev.map((item) => ({ ...item, selected: !allSelected }));
    });
  };

  const toggleItem = (index: number) => {
    setExtractedList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)),
    );
  };

  return {
    passageText,
    setPassageText,
    limit,
    setLimit,
    focusMode,
    setFocusMode,
    mustIncludeWords,
    setMustIncludeWords,
    extractedList,
    hasExtracted,
    loading,
    handleExtract,
    handleSave,
    toggleAll,
    toggleItem,
  };
}