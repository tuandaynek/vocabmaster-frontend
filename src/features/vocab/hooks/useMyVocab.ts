import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { vocabApi } from "../api/vocabApi";
import type { UserVocabularyItem } from "../types";
import {
  type FilterKey,
  getStatusBucket,
  getVocabErrorMessage,
} from "../utils/vocabUtils";

export function useMyVocab() {
  const [items, setItems] = useState<UserVocabularyItem[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void vocabApi
      .getUserList()
      .then((response) => {
        if (active) setItems(response?.data ?? []);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(
            getVocabErrorMessage(error, "Không thể tải kho từ cá nhân"),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter !== "all" && getStatusBucket(item) !== filter) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const wordMatch = item.global_words?.word?.toLowerCase().includes(query);
        const meaningMatch = item.global_words?.meaning?.toLowerCase().includes(query);
        const contextMatch = item.context_sentence?.toLowerCase().includes(query);
        return wordMatch || meaningMatch || contextMatch;
      }
      return true;
    });
  }, [items, filter, search]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await vocabApi.deleteUserVocabulary(id);
      toast.success("Đã xoá khỏi kho từ cá nhân");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: unknown) {
      toast.error(getVocabErrorMessage(error, "Không thể xoá từ này"));
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: items.length,
      learning: items.filter((item) => getStatusBucket(item) === "learning").length,
      review: items.filter((item) => getStatusBucket(item) === "review").length,
      mastered: items.filter((item) => getStatusBucket(item) === "mastered").length,
    };
  }, [items]);

  return {
    items,
    filteredItems,
    filter,
    setFilter,
    search,
    setSearch,
    loading,
    deletingId,
    handleDelete,
    stats,
  };
}