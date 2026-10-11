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

// (Optional) Giữ lại EvaluationResult nếu cần làm Alias để không vỡ các code cũ
export type EvaluationResult = EvaluationResponse;

export interface ChatStepRequest {
  question: string;
  targetBand: string;
  history: { role: string; content: string }[];
  userResponse: string;
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