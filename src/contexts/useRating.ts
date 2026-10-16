import { useContext } from "react";
import { RatingContext } from "./rating-context";

export function useRating() {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error("useRating phải được sử dụng bên trong RatingProvider");
  }
  return context;
}
