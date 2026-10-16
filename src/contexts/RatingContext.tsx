import { useState, type ReactNode } from "react";
import { RatingModal } from "@/features/website/components/RatingModal";
import { websiteApi } from "@/features/website/api/websiteApi";
import { toast } from "sonner";
import { RatingContext } from "./rating-context";
import type { RatingMeta } from "./rating-context";

function readRatedFeatures(): string[] {
  const cached = localStorage.getItem("rated_features");
  if (!cached) return [];

  try {
    const parsed: unknown = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.every((feature) => typeof feature === "string")) {
      return parsed;
    }
  } catch {
    localStorage.removeItem("rated_features");
    return [];
  }

  localStorage.removeItem("rated_features");
  return [];
}

export function RatingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ratingMeta, setRatingMeta] = useState<RatingMeta | null>(null);
  const [ratedFeatures, setRatedFeatures] = useState<string[]>(readRatedFeatures);

  // Kiểm tra tính năng có nằm trong danh sách đã rate hay không
  const isFeatureRated = (featureName: string) => {
    return ratedFeatures.includes(featureName);
  };

  // 2. Khi gọi mở đánh giá cho một feature cụ thể
  const openRating = async (meta: RatingMeta) => {
    // Kiểm tra ngay trong state/local hiện tại xem đã chứa CHÍNH XÁC feature này chưa
    if (ratedFeatures.includes(meta.feature)) {
      if (meta.onClose) meta.onClose();
      return;
    }

    // Nếu chưa có, gọi backend lấy danh sách mới nhất về để check lại cho chắc chắn
    try {
      const response = await websiteApi.getRatedFeatures();
      const features: string[] = response;

      // Cập nhật lại state và localStorage
      setRatedFeatures(features);
      localStorage.setItem("rated_features", JSON.stringify(features));

      // Kiểm tra lại lần nữa với danh sách chuẩn từ server
      if (features.includes(meta.feature)) {
        if (meta.onClose) meta.onClose();
        return;
      }
    } catch {
      toast.error("Không thể đồng bộ lịch sử đánh giá. Bạn vẫn có thể gửi đánh giá.");
    }

    // Nếu check cả local lẫn server đều chưa có -> Mở modal cho user rate
    setRatingMeta(meta);
    setIsOpen(true);
  };

  const closeRating = () => {
    setIsOpen(false);
    if (ratingMeta?.onClose) {
      ratingMeta.onClose();
    }
    setRatingMeta(null);
  };

  const handleSubmitRating = async (data: { rating: number; fastComments: string[]; comment: string }) => {
    const combinedComments = [
      ...(data.fastComments || []),
      ...(data.comment ? [data.comment.trim()] : []),
    ].filter(Boolean).join(" | ");

    const featureName = ratingMeta ? ratingMeta.feature : "";

    // 1. Gọi API đẩy đánh giá xuống backend
    await websiteApi.pushRating(featureName, data.rating, combinedComments);

    // 2. Cập nhật State và lưu thẳng vào LocalStorage
    if (featureName && !ratedFeatures.includes(featureName)) {
      const updated = [...ratedFeatures, featureName];
      setRatedFeatures(updated);
      localStorage.setItem("rated_features", JSON.stringify(updated));
    }
  };

  return (
    <RatingContext.Provider value={{ openRating, closeRating, isFeatureRated }}>
      {children}
      <RatingModal
        isOpen={isOpen}
        onClose={closeRating}
        title={ratingMeta?.title}
        description={ratingMeta?.description}
        fastComments={ratingMeta?.fastComments}
        onSubmitRating={handleSubmitRating}
      />
    </RatingContext.Provider>
  );
}
