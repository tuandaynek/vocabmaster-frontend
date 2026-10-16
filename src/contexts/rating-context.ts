import { createContext } from "react";

export interface RatingMeta {
  feature: string;
  title?: string;
  description?: string;
  fastComments?: string[];
  onClose?: () => void;
}

export interface RatingContextValue {
  openRating: (meta: RatingMeta) => void;
  closeRating: () => void;
  isFeatureRated: (featureName: string) => boolean;
}

export const RatingContext = createContext<RatingContextValue | undefined>(
  undefined,
);
