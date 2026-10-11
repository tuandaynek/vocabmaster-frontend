import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { RatingModal } from "@/features/website/components/RatingModal";
import { websiteApi } from "@/features/website/api/websiteApi";

interface RatingMeta {
  feature: string;
  title?: string;
  description?: string;
  fastComments?: string[];
  onClose?: () => void;
}

interface RatingContextType {
  openRating: (meta: RatingMeta) => void;
  closeRating: () => void;
  isFeatureRated: (featureName: string) => boolean;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export function RatingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ratingMeta, setRatingMeta] = useState<RatingMeta | null>(null);
  
  // Khởi tạo state bằng cách đọc ngay từ localStorage (nếu có)
  const [ratedFeatures, setRatedFeatures] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem("rated_features");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // 1. Khi app load, chỉ đơn giản đọc cache lên state để có dữ liệu sẵn sàng
  useEffect(() => {
    const loadCache = () => {
      const cached = localStorage.getItem("rated_features");
      if (cached) {
        try {
          setRatedFeatures(JSON.parse(cached));
        } catch (e) {
          console.error("Lỗi parse cache rated_features:", e);
        }
      }
    };

    loadCache();
  }, []);

  // Kiểm tra tính năng có nằm trong danh sách đã rate hay không
  const isFeatureRated = (featureName: string) => {
    return ratedFeatures.includes(featureName);
  };

  // 2. Khi gọi mở đánh giá cho một feature cụ thể
  const openRating = async (meta: RatingMeta) => {
    // Kiểm tra ngay trong state/local hiện tại xem đã chứa CHÍNH XÁC feature này chưa
    if (ratedFeatures.includes(meta.feature)) {
      console.log(`Tính năng "${meta.feature}" đã có trong danh sách đã đánh giá.`);
      if (meta.onClose) meta.onClose();
      return; // Đã rate tính năng này rồi thì bỏ qua luôn
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
    } catch (error) {
      console.error("Lỗi đồng bộ danh sách đã rate:", error);
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

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error("useRating phải được sử dụng bên trong RatingProvider");
  }
  return context;
};