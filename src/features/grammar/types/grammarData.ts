export type GameType =
  | "puzzle"
  | "error"
  | "speed"
  | "transformer"
  | "context";

export interface FormulaDetail {
  tag: string;
  structure: string;
  note: string;
}

export interface ExampleDetail {
  sentence: string;
  translation: string;
  note: string;
}

export interface TrapDetail {
  wrong: string;
  correct: string;
  explanation: string;
}

export interface TheorySlideContent {
  formulas: FormulaDetail[];
  usageSignals: string[];
  examples: ExampleDetail[];
  traps: TrapDetail[];
}

export interface PuzzleQuestion {
  id: string;
  vietnamesePrompt: string;
  correctSentence: string[];
}

export interface ErrorWordOption {
  key: "A" | "B" | "C" | "D";
  text: string;
  isError: boolean;
  correctForm?: string;
}

export interface ErrorQuestion {
  id: string;
  sentenceParts: {
    prefix?: string;
    optionA: ErrorWordOption;
    mid1?: string;
    optionB: ErrorWordOption;
    mid2?: string;
    optionC: ErrorWordOption;
    mid3?: string;
    optionD: ErrorWordOption;
    suffix?: string;
  };
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface TransformerQuestion {
  id: string;
  originalSentence: string;
  targetPrompt: string;
  correctBlocks: string[];
  distractorBlocks: string[];
  explanation: string;
}

export interface ScenarioOption {
  id: string;
  text: string;
  isCorrect: boolean;
  nuanceExplanation: string;
}

export interface ContextQuestion {
  id: string;
  speakerA: string;
  speakerBContext: string;
  options: ScenarioOption[];
  explanation: string;
}

export interface SubTopicStageSummary {
  id: string;
  type: GameType;
  questionCount: number;
}

export interface SubTopic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  orderIndex: number;
  theory: TheorySlideContent;
  gameStageIds: string[];
  stages: SubTopicStageSummary[];
  progress: number;
  isMastered: boolean;
  isLocked: boolean;
}

interface GameStageBase {
  id: string;
  title: string;
  topicId: string;
  subTopicId: string;
  subTopicTitle: string;
  orderIndex: number;
}

export type GameStage =
  | (GameStageBase & { type: "puzzle"; questions: PuzzleQuestion[] })
  | (GameStageBase & { type: "error"; questions: ErrorQuestion[] })
  | (GameStageBase & { type: "speed"; questions: QuizQuestion[] })
  | (GameStageBase & { type: "transformer"; questions: TransformerQuestion[] })
  | (GameStageBase & { type: "context"; questions: ContextQuestion[] });

export interface GrammarTopic {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  level: string;
  progress: number;
  isLocked: boolean;
  badgeColor: string;
  iconBg: string;
  subTopics: SubTopic[];
}
