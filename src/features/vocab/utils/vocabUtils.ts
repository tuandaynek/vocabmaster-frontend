import type { UserVocabularyItem } from "../types";

export type FilterKey = "all" | "learning" | "review" | "mastered";

export const FILTER_OPTIONS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "learning", label: "Đang học" },
  { key: "review", label: "Cần ôn" },
  { key: "mastered", label: "Đã thuộc" },
];

export const getStatusBucket = (item: UserVocabularyItem): FilterKey => {
  if (item.status === "mastered") return "mastered";

  const reviewDate = item.next_review ? new Date(item.next_review).getTime() : Number.MAX_SAFE_INTEGER;
  return reviewDate <= Date.now() ? "review" : "learning";
};

export const getStatusLabel = (item: UserVocabularyItem) => {
  const bucket = getStatusBucket(item);
  if (bucket === "mastered") return "Đã thuộc";
  if (bucket === "review") return "Cần ôn";
  return "Đang học";
};