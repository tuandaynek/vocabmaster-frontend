import { normalizeSpeechText } from "../utils/speechUtils";

/**
 * Xóa dấu câu và đưa về chữ thường
 */
export const cleanText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .trim();
};

/**
 * Tách câu thành mảng từ sạch (đã normalize contraction)
 */
export const getCleanWords = (text: string): string[] => {
  if (!text) return [];
  const normalized = normalizeSpeechText(text);
  return cleanText(normalized).split(/\s+/).filter(Boolean);
};

/**
 * Kiểm tra index từ trong câu có thuộc cụm targetPhrase không
 */
export const isWordInCollocation = (
  sentenceIndex: number,
  sentence: string,
  targetPhrase: string
): boolean => {
  if (!sentence || !targetPhrase) return false;

  const cleanSentenceWords = cleanText(sentence).split(/\s+/).filter(Boolean);
  const cleanPhraseWords = cleanText(targetPhrase).split(/\s+/).filter(Boolean);

  if (cleanPhraseWords.length === 0) return false;

  // Tim vị trí bắt đầu của cụm phrase trong câu
  for (
    let i = 0;
    i <= cleanSentenceWords.length - cleanPhraseWords.length;
    i++
  ) {
    let match = true;
    for (let j = 0; j < cleanPhraseWords.length; j++) {
      if (cleanSentenceWords[i + j] !== cleanPhraseWords[j]) {
        match = false;
        break;
      }
    }
    if (
      match &&
      sentenceIndex >= i &&
      sentenceIndex < i + cleanPhraseWords.length
    ) {
      return true;
    }
  }
  return false;
};