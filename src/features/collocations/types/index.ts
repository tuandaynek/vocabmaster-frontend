export type ReviewRating = "again" | "hard" | "good" | "easy";

export type CollocationType = "grammatical" | "lexical" | "opinion" | "frequency";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type CEFRLevel = (typeof CEFR_LEVELS)[number];

export const CORE_TOPICS = [
  "Hometown",
  "Work & Study",
  "Accommodation",
  "Personal Background",
  "Daily Routine",
  "Hobbies & Leisure",
  "Food & Cooking",
  "Shopping",
  "Travel & Holidays",
  "Technology",
  "Health & Fitness",
  "Environment",
] as const;
export type CoreTopicType = (typeof CORE_TOPICS)[number];

export interface DrillVariations {
  change_verb?: string[];
  change_tense_person?: string[];
  change_adj_adv?: string[];
  clause_expansion?: string[];
}

export interface GlobalCollocationItem {
  id: string;
  phrase: string;
  pattern: string;
  type: CollocationType;
  cefr_level: CEFRLevel;
  topic: string;
  meaning: string;
  usage_note?: string;
  explanation?: string;
  ipa?: string;
  context_sentence?: string;
  base_sentence?: string;
  drill_variations?: DrillVariations;
  audio_url?: string | null;
  created_at?: string;
}

export interface CollocationSavePayload {
  selectedCollocations: Array<{ id: string; collocation_id?: string; base_sentence?: string }>;
}

export interface UserCollocationItem {
  id: string;
  user_id?: string;
  collocation_id?: string;
  context_sentence: string;
  status: string;
  step: number;
  interval: number;
  next_review: string;
  ease_factor?: number;
  global_collocations: GlobalCollocationItem | null;
}

export interface ReviewRequestPayload {
  user_vocab_id: string;
  rating: ReviewRating;
}

export interface UserCollocationListResponse {
  success: boolean;
  data: UserCollocationItem[];
}

export interface GlobalCollocationsQueryParams {
  search?: string;
  type?: string;
  topic?: string;
  cefr?: string;
  page?: number;
  limit?: number;
}

export interface GlobalCollocationsResponse {
  success: boolean;
  data: GlobalCollocationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CollocationReviewData {
  collocationId: string;
  phrase: string;
  meaning: string;
  audioUrl?: string | null;
  baseSentence?: string;
}

export interface NextCollocationItem {
  id: string;
  phrase: string;
  meaning: string;
  audioUrl?: string | null;
  baseSentence?: string;
}
