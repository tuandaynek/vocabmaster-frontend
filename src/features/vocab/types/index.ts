export type FocusMode =
  | "IELTS Academic"
  | "SAT / GMAT"
  | "Collocations & Phrasal Verbs"
  | "Prefix & Suffix Deep Dive";

export interface VocabExtractItem {
  word: string;
  context_sentence: string;
}

export interface VocabExtractResponse {
  success: boolean;
  data: VocabExtractItem[];
}

export interface VocabExtractPayload {
  passage: string;
  limit: number;
  focusMode: FocusMode;
  mustIncludeWords: string[];
}

export interface VocabSavePayload {
  selectedWords: VocabExtractItem[];
}

export interface VocabListItem extends VocabExtractItem {
  selected: boolean;
  word_family?: Array<{ word?: string; pos?: string; meaning?: string }>;
  prefix_suffix?: Record<string, string>;
  ipa?: string | null;
  pos?: string;
  meaning?: string;
  usage_note?: string;
}

export interface GlobalWordInfo {
  id: string;
  word: string;
  slug: string;
  word_type?: string;
  pos?: string;
  ipa?: string | null;
  audio_url?: string | null;
  meaning?: string;
  meanings?: Array<{
    meaning?: string;
    example?: string;
    translation?: string;
    note?: string;
    explanation?: string;
    synonym?: string;
    antonym?: string;
  }>;
  context_sentence?: string | null;
  context_sentences?: string[];
  prefix_suffix?: Record<string, string>;
  word_family?: Array<{ word?: string; pos?: string; meaning?: string }>;
  collocations?: Array<{
    phrase?: string;
    meaning?: string;
    type?: string;
    usage_note?: string;
  }>;
}

export interface GlobalDictionaryItem extends GlobalWordInfo {
  context_sentences?: string[];
  created_at?: string;
}

export interface GlobalDictionaryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GlobalDictionaryResponse {
  success: boolean;
  data: GlobalDictionaryItem[];
  pagination: GlobalDictionaryPagination;
}

export interface UserVocabularyItem {
  id: string;
  context_sentence: string;
  status: string;
  step: number;
  interval: number;
  next_review: string;
  created_at?: string;
  word_id?: string;
  global_words: GlobalWordInfo | null;
  ease_factor?: number;
}

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewRequestPayload {
  user_vocab_id: string;
  rating: ReviewRating;
}

export interface UserVocabularyListResponse {
  success: boolean;
  data: UserVocabularyItem[];
}

export interface GlobalDictionaryQueryParams {
  search?: string;
  pos?: string;
  wordType?: string;
  page?: number;
  limit?: number;
}
