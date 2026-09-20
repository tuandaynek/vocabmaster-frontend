// map các dạng nói nối / biến âm phổ biến sang dạng chuẩn
export const CONTRACTION_MAP: Record<string, string> = {
  wanna: "want to",
  gonna: "going to",
  gotta: "got to",
  kinda: "kind of",
  sorta: "sort of",
  outta: "out of",
  dunno: "don't know",
  gimme: "give me",
  hafta: "have to",
  lemme: "let me",
  whatcha: "what are you",
};

/**
 * Hàm chuẩn hóa transcript từ STT browser:
 * - Chuyển về chữ thường, xóa dấu câu thừa.
 * - Quy đổi biến âm (wanna -> want to) để so khớp chính xác với target text.
 */
export const normalizeSpeechText = (text: string): string => {
  if (!text) return "";

  // 1. Chuyển chữ thường và làm sạch khoảng trắng dư thừa
  let normalized = text.toLowerCase().trim();

  // 2. Thay thế các biến âm bằng cụm từ chuẩn
  Object.entries(CONTRACTION_MAP).forEach(([informal, formal]) => {
    // Regex tìm chính xác từ độc lập (tránh thay thế nhầm từ chứa chuỗi tương tự)
    const regex = new RegExp(`\\b${informal}\\b`, "gi");
    normalized = normalized.replace(regex, formal);
  });

  return normalized;
};