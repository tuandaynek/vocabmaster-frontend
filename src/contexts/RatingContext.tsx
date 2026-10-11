import { createContext, useContext, useState, type ReactNode } from "react";
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
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export function RatingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ratingMeta, setRatingMeta] = useState<RatingMeta | null>(null);

  const openRating = (meta: RatingMeta) => {
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
    // Ép và nén fastComments gộp chung vào nội dung comment
    const combinedComments = [
      ...(data.fastComments || []),
      ...(data.comment ? [data.comment.trim()] : []),
    ].filter(Boolean).join(" | ");

    console.log("🚀 [GLOBAL RATING LOG]:", {
      feature_name: ratingMeta?.feature,
      rating: data.rating,
      comment: combinedComments, // Đã gộp chung fastComments và comment
    });

    const featureName = ratingMeta ? ratingMeta.feature : ""

    await websiteApi.pushRating(featureName, data.rating, combinedComments);
  };

  return (
    <RatingContext.Provider value={{ openRating, closeRating }}>
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