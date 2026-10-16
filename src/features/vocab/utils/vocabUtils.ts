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

export const getVocabErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error !== "object" || error === null) return fallback;

  const value = error as Record<string, unknown>;
  const response = value.response;
  if (typeof response === "object" && response !== null) {
    const data = (response as Record<string, unknown>).data;
    if (typeof data === "object" && data !== null) {
      const message = (data as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
  }

  return typeof value.message === "string" ? value.message : fallback;
};