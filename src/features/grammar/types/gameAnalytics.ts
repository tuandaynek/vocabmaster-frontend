export interface CampaignAnswer {
  stageId: string;
  subTopicTitle: string;
  questionId: string;
  prompt: string;
  correctAnswer: string;
  submittedAnswer: string;
  isCorrect: boolean;
}

export interface GameStageResult {
  xpEarned: number;
  livesRemaining: number;
}

export type SessionIntensity = 'quick' | 'standard' | 'full';
