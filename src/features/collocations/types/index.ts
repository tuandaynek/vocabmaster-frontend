export type ReviewRating = "again" | "hard" | "good" | "easy";

import {
  CEFR_LEVELS,
  COLLOCATION_TYPES,
  CORE_TOPICS,
} from "../constants";

export type CollocationType = (typeof COLLOCATION_TYPES)[number];
export type CEFRLevel = (typeof CEFR_LEVELS)[number];
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
  base_sentence?: string;
  drill_variations?: DrillVariations;
  audio_url?: string | null;
  created_at?: string;
}

export interface CollocationImportItem {
  id?: string;
  phrase: string;
  meaning: string;
  type?: CollocationType;
  pattern?: string;
  cefr_level?: CEFRLevel;
  topic?: string;
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
  user_step?: number;
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
  id?: string;
  phrase: string;
  meaning: string;
  audioUrl?: string | null;
  baseSentence?: string;
  sample_sentences?: string[];
  step?: number;
  user_step?: number;
}

export interface CollocationVariation {
  id: number;
  type: string;
  sentence: string;
  note: string;
}

export interface CollocationVariationsResponse {
  mode: "ACTIVE" | "DRILL";
  step: number;
  variations?: CollocationVariation[];
}

export interface ApiDataEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Phase1TranslationApiResponse {
  vi_sentence?: string;
  accepted_answer?: string;
  suggested_vocab?: SuggestedVocab[];
  suggest_vocab?: SuggestedVocab[];
  viSentence?: string;
  acceptedAnswer?: string;
  suggestedVocab?: SuggestedVocab[];
}

export interface NextCollocationItem {
  id: string;
  phrase: string;
  meaning: string;
  audioUrl?: string | null;
  baseSentence?: string;
}

export interface SuggestedVocab {
  word: string;
  meaning: string;
}

export interface Phase1DataResponse {
  collocationId: string;
  phrase: string;
  viSentence: string;        // AI generate hoặc lấy từ Cache
  acceptedAnswer: string;    // Đáp án mẫu đơn giản, tự nhiên sát context
  suggestedVocab: SuggestedVocab[];
}

export type EvaluationState = "Not completed" | "Good" | "Excellent";

export interface EvaluatePhase2Payload {
  collocationId: string;
  userSentence: string;
  audioBlob?: Blob; // Nếu nói ở lần ôn tập sau
}

export interface EvaluatePhase2Response {
  state: EvaluationState;
  feedback: string;
  correctedSentence?: string;
  communitySentences: string[]; // Trả về tối đa 5 câu Excellent đã lưu trong DB
}

export interface EvaluatePhase3Payload {
  collocationId: string;
  userStory: string; // Tối đa/Tối thiểu >= 3 câu
  mode: "custom_story" | "translate_story";
}

// Response cho Phase 3 (Short Story / Translation)
export interface EvaluatePhase3Response {
  state: EvaluationState;
  score?: number;
  isPassed?: boolean;
  feedback: string;
  correctedStory?: string;
  communityStories: string[]; // Tối đa 5 bài Short Story Excellent
  highlightedErrors?: Array<{
    error: string;
    correction: string;
  }>;
}