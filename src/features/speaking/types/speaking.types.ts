export type PracticeTab = "Part 1" | "Part 2" | "Part 3" | "Custom Question";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type AssistantTab = "hints" | "collocations";

export interface Question {
  id: string;
  text: string;
  difficulty: Difficulty;
  estimatedTime: string;
}

export interface Topic {
  name: string;
  icon: string;
  description: string;
  questions: Question[];
}

export interface IdeaHints {
  answerStructure: string[];
  prompts: string[];
}

export type IdeaHintsResponse = IdeaHints;

export interface CollocationItem {
  phrase: string;
  meaning: string;
}

// --- EVALUATION RESPONSE TYPES ---

export interface BandScores {
  overall: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammarAccuracy: number;
  pronunciation: number | null;
}

export interface CoherenceFeedback {
  statusTag: string;
  analysis: string;
  actionableTip: string;
}

export interface StrategyFeedback {
  examinerPerspective: string;
  actionableAdvice: string;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface LexicalUpgrade {
  original: string;
  upgrade: string;
  meaning: string;
  example?: string;
}

export interface PronunciationFeedback {
  word: string;
  ipa: string;
  issue: string;
  tip: string;
  severity: "CRITICAL" | "MINOR";
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface FluencyFeedback {
  pacingAndPauses: string;
  chunkingTip: string;
}

export interface EvaluationResponse {
  userAudioUrl?: string;
  transcript?: string;
  bandScores: BandScores;
  coherenceFeedback?: CoherenceFeedback;
  strategyFeedback: StrategyFeedback;
  grammarCorrections: GrammarCorrection[];
  lexicalUpgrades: LexicalUpgrade[];
  pronunciationFeedback: PronunciationFeedback[];
  wordTimestamps?: WordTimestamp[];
  fluencyFeedback: FluencyFeedback;
  sampleAnswer: string;
}

export type EvaluationResult = EvaluationResponse;

export interface ChatStepRequest {
  question: string;
  targetBand: string;
  history: { role: string; content: string }[];
  userResponse: string;
}

export interface ChatStepResponse {
  needsFollowUp: boolean;
  followUpQuestion?: string;
}

export interface IdeaHintsRequest {
  question: string;
  history: { role: string; content: string }[];
}

export interface SpeakingApiResponse<T> {
  data: T;
}

export interface EvaluatePayload {
  question: string;
  targetBand: string;
  fullTranscript: string;
  audioBlob?: Blob;
  mimeType?: string;
}

export interface CollocationsPayload {
  vietnamesePhrase: string;
  currentQuestion: string;
  targetBand: string;
}

export interface SaveSpeakingHistoryPayload {
  question: string;
  audioUrl?: string;
  transcript?: string;
  overallBand: number;
  detailedScores: BandScores;
  createdAt: string;
}

export interface TtsResponse {
  audioBase64: string;
}

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly 0: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultListLike {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionResultEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionInstanceLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onend?: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export type SpeechRecognitionConstructorLike = new () => SpeechRecognitionInstanceLike;