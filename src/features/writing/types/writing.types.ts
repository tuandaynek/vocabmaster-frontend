// src/features/writing/types/writing.types.ts

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BandScores {
  taskResponse: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overall: number;
}

export interface CriterionDiagnostic {
  strengths: string[];
  weaknesses: string[];
  actionPlan: string;
}

export interface InlineCorrection {
  originalSentence: string;
  correctedSentence: string;
  explanation: string;
  type: string;
}

export interface HighValueVocabulary {
  originalPhrase: string;
  bandUpgrade: string;
  contextExample: string;
}

export interface Evaluation {
  bandScores: BandScores;
  counselorSummary: string;
  criteriaDiagnostics: Record<string, CriterionDiagnostic>;
  inlineCorrections: InlineCorrection[];
  highValueVocabulary: HighValueVocabulary[];
  incrementalUpgradedEssay: string;
}