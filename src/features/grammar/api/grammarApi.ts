import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  ContextQuestion,
  ErrorQuestion,
  ErrorWordOption,
  GameStage,
  GameType,
  GrammarTopic,
  PuzzleQuestion,
  QuizQuestion,
  ScenarioOption,
  SubTopic,
  SubTopicStageSummary,
  TheorySlideContent,
  TransformerQuestion,
} from "../types/grammarData";
import type {
  GrammarProgressRecord,
  GrammarSessionProgressPayload,
} from "../types/grammarApi";
export type {
  GrammarProgressRecord,
  GrammarSessionProgressPayload,
} from "../types/grammarApi";
import { GRAMMAR_GAME_TYPES } from "../constants/grammarConstants";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface DbTopic {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  level: string;
  badge_color: string | null;
  icon_bg: string | null;
  grammar_sub_topics?: DbSubTopic[];
  progress?: number;
  isLocked?: boolean;
}

interface DbSubTopic {
  id: string;
  topic_id: string;
  title: string;
  description: string | null;
  theory_content?: unknown;
  order_index: number | null;
  progress?: number;
  is_mastered?: boolean;
  is_locked?: boolean;
  grammar_game_stages?: Array<{
    id: string;
    game_type: GameType;
    grammar_questions?: Array<{ id: string }>;
  }>;
}

interface DbStage {
  id: string;
  sub_topic_id: string;
  title: string;
  game_type: GameType;
  order_index: number | null;
}

interface DbQuestion {
  id: string;
  stage_id: string;
  question_type: GameType;
  payload: unknown;
  order_index: number | null;
}

const unwrap = <T>(raw: unknown): T => {
  const envelope = raw as Partial<ApiEnvelope<T>>;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    if (!envelope.success) {
      throw new Error(envelope.error ?? envelope.message ?? "Grammar API request failed.");
    }
    return envelope.data as T;
  }
  return raw as T;
};

const requestData = async <T>(request: Promise<unknown>): Promise<T> =>
  unwrap<T>(await request);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requiredString = (
  object: Record<string, unknown>,
  key: string,
  context: string,
) => {
  const value = object[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${context} is missing required field "${key}".`);
  }
  return value;
};

const stringList = (
  object: Record<string, unknown>,
  key: string,
  context: string,
) => {
  const value = object[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${context} field "${key}" must be an array of strings.`);
  }
  return value;
};

const theoryContentFromDb = (value: unknown): TheorySlideContent => {
  if (!isRecord(value)) {
    return { formulas: [], usageSignals: [], examples: [], traps: [] };
  }
  return {
    formulas: Array.isArray(value.formulas) ? value.formulas as TheorySlideContent["formulas"] : [],
    usageSignals: Array.isArray(value.usageSignals)
      ? value.usageSignals.filter((item): item is string => typeof item === "string")
      : [],
    examples: Array.isArray(value.examples) ? value.examples as TheorySlideContent["examples"] : [],
    traps: Array.isArray(value.traps) ? value.traps as TheorySlideContent["traps"] : [],
  };
};

const subTopicFromDb = (row: DbSubTopic): SubTopic => {
  const stages = (row.grammar_game_stages ?? []).map((stage) => ({
    id: stage.id,
    type: stage.game_type,
    questionCount: stage.grammar_questions?.length ?? 0,
  })) satisfies SubTopicStageSummary[];
  return {
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    description: row.description ?? "",
    orderIndex: row.order_index ?? 0,
    theory: theoryContentFromDb(row.theory_content),
    gameStageIds: stages.map((stage) => stage.id),
    stages,
    progress: row.progress ?? 0,
    isMastered: row.is_mastered ?? false,
    isLocked: row.is_locked ?? false,
  };
};

const topicFromDb = (row: DbTopic): GrammarTopic => {
  const subTopics = (row.grammar_sub_topics ?? [])
    .map(subTopicFromDb)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    level: row.level,
    progress:
      row.progress ??
      (subTopics.length
        ? Math.round(
            subTopics.reduce((total, subTopic) => total + subTopic.progress, 0) /
              subTopics.length,
          )
        : 0),
    isLocked: row.isLocked ?? (subTopics.length > 0 && subTopics.every((item) => item.isLocked)),
    badgeColor: row.badge_color ?? "bg-indigo-100 text-indigo-700 border-indigo-200",
    iconBg: row.icon_bg ?? "bg-indigo-500",
    subTopics,
  };
};

const mapQuestion = (row: DbQuestion) => {
  if (!isRecord(row.payload)) {
    throw new Error(`Question ${row.id} has an invalid payload.`);
  }
  const payload = row.payload;
  const context = `Question ${row.id}`;
  const explanation =
    typeof payload.explanation === "string" ? payload.explanation : "";

  switch (row.question_type) {
    case "puzzle": {
      if (
        typeof payload.vietnamesePrompt !== "string" ||
        !Array.isArray(payload.correctSentence) ||
        !payload.correctSentence.every((word) => typeof word === "string")
      ) {
        throw new Error(
          `${context} puzzle payload requires a vietnamesePrompt string and correctSentence string array.`,
        );
      }
      return {
        id: row.id,
        vietnamesePrompt: payload.vietnamesePrompt,
        correctSentence: payload.correctSentence,
      } satisfies PuzzleQuestion;
    }
    case "error": {
      const parts = payload.sentenceParts;
      if (!isRecord(parts)) {
        throw new Error(`${context} error payload requires sentenceParts.`);
      }
      const options = (["A", "B", "C", "D"] as const).map((letter) => {
        const rawOption = parts[`option${letter}`];
        if (!isRecord(rawOption) || typeof rawOption.text !== "string") {
          throw new Error(`${context} error payload is missing option ${letter}.`);
        }
        return {
          key: letter,
          text: rawOption.text,
          isError: rawOption.isError === true,
          ...(typeof rawOption.correctForm === "string"
            ? { correctForm: rawOption.correctForm }
            : {}),
        } satisfies ErrorWordOption;
      });
      return {
        id: row.id,
        sentenceParts: {
          prefix: typeof parts.prefix === "string" ? parts.prefix : "",
          optionA: options[0],
          mid1: typeof parts.mid1 === "string" ? parts.mid1 : "",
          optionB: options[1],
          mid2: typeof parts.mid2 === "string" ? parts.mid2 : "",
          optionC: options[2],
          mid3: typeof parts.mid3 === "string" ? parts.mid3 : "",
          optionD: options[3],
          suffix: typeof parts.suffix === "string" ? parts.suffix : "",
        },
        explanation,
      } satisfies ErrorQuestion;
    }
    case "speed": {
      const question = requiredString(payload, "question", context);
      const options = stringList(payload, "options", context);
      const correctAnswer = requiredString(payload, "correctAnswer", context);
      if (!options.includes(correctAnswer)) {
        throw new Error(`${context} correctAnswer must match one of its options.`);
      }
      return { id: row.id, question, options, correctAnswer, explanation } satisfies QuizQuestion;
    }
    case "transformer":
      return {
        id: row.id,
        originalSentence: requiredString(payload, "originalSentence", context),
        targetPrompt: requiredString(payload, "targetPrompt", context),
        correctBlocks: stringList(payload, "correctBlocks", context),
        distractorBlocks: stringList(payload, "distractorBlocks", context),
        explanation,
      } satisfies TransformerQuestion;
    case "context": {
      const rawOptions = payload.options;
      if (!Array.isArray(rawOptions)) {
        throw new Error(`${context} context payload requires options.`);
      }
      const options = rawOptions.map((rawOption, index) => {
        if (!isRecord(rawOption) || typeof rawOption.text !== "string") {
          throw new Error(`${context} context option ${index + 1} is invalid.`);
        }
        return {
          id:
            typeof rawOption.id === "string"
              ? rawOption.id
              : `${row.id}-option-${index + 1}`,
          text: rawOption.text,
          isCorrect: rawOption.isCorrect === true,
          nuanceExplanation:
            typeof rawOption.nuanceExplanation === "string"
              ? rawOption.nuanceExplanation
              : "",
        } satisfies ScenarioOption;
      });
      if (options.filter((option) => option.isCorrect).length !== 1) {
        throw new Error(`${context} context payload must have exactly one correct option.`);
      }
      return {
        id: row.id,
        speakerA: requiredString(payload, "speakerA", context),
        speakerBContext: requiredString(payload, "speakerBContext", context),
        options,
        explanation,
      } satisfies ContextQuestion;
    }
  }
};

const toGameStage = async (
  stage: DbStage,
  topicId: string,
  subTopicTitle: string,
): Promise<GameStage> => {
  if (!GRAMMAR_GAME_TYPES.includes(stage.game_type)) {
    throw new Error(`Stage ${stage.id} has an unsupported game type.`);
  }
  const questions = await grammarApi.getQuestionsByStage(stage.id, stage.game_type);
  const base = {
    id: stage.id,
    title: stage.title,
    topicId,
    subTopicId: stage.sub_topic_id,
    subTopicTitle,
    orderIndex: stage.order_index ?? 0,
  };
  switch (stage.game_type) {
    case "puzzle":
      return { ...base, type: "puzzle", questions: questions as PuzzleQuestion[] };
    case "error":
      return { ...base, type: "error", questions: questions as ErrorQuestion[] };
    case "speed":
      return { ...base, type: "speed", questions: questions as QuizQuestion[] };
    case "transformer":
      return { ...base, type: "transformer", questions: questions as TransformerQuestion[] };
    case "context":
      return { ...base, type: "context", questions: questions as ContextQuestion[] };
  }
};

export const grammarApi = {
  getTopics: async (): Promise<GrammarTopic[]> => {
    const rows = await requestData<DbTopic[]>(
      axiosClient.get(ENDPOINTS.GRAMMAR.GET_TOPICS),
    );
    return (rows ?? []).map(topicFromDb);
  },

  getSubTopicsByTopic: async (topicId: string): Promise<SubTopic[]> => {
    const rows = await requestData<DbSubTopic[]>(
      axiosClient.get(ENDPOINTS.GRAMMAR.GET_SUB_TOPICS(topicId)),
    );
    return (rows ?? []).map(subTopicFromDb);
  },

  getSubTopicDetail: async (subTopicId: string): Promise<SubTopic> => {
    const row = await requestData<DbSubTopic>(
      axiosClient.get(ENDPOINTS.GRAMMAR.GET_SUB_TOPIC_DETAIL(subTopicId)),
    );
    return subTopicFromDb(row);
  },

  getStagesBySubTopic: async (
    subTopicId: string,
    topicId: string,
    subTopicTitle: string,
  ): Promise<GameStage[]> => {
    const rows = await requestData<DbStage[]>(
      axiosClient.get(ENDPOINTS.GRAMMAR.GET_STAGES(subTopicId)),
    );
    const stages = await Promise.all(
      (rows ?? []).map((stage) => toGameStage(stage, topicId, subTopicTitle)),
    );
    return stages
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },

  getQuestionsByStage: async (
    stageId: string,
    expectedType?: GameType,
  ): Promise<Array<
    PuzzleQuestion | ErrorQuestion | QuizQuestion | TransformerQuestion | ContextQuestion
  >> => {
    const rows = await requestData<DbQuestion[]>(
      axiosClient.get(ENDPOINTS.GRAMMAR.GET_QUESTIONS(stageId)),
    );
    return (rows ?? []).map((row) => {
      if (expectedType && row.question_type !== expectedType) {
        throw new Error(
          `Question ${row.id} type does not match its stage type "${expectedType}".`,
        );
      }
      return mapQuestion(row);
    });
  },

  submitSessionProgress: (sessionData: GrammarSessionProgressPayload) =>
    requestData<{ progress: GrammarProgressRecord; xpGained: number }>(
      axiosClient.post(ENDPOINTS.GRAMMAR.SUBMIT_SESSION, sessionData),
    ),

  saveSubTopicCompletion: async (sessionData: GrammarSessionProgressPayload) => {
    if (
      sessionData.totalQuestions < 1 ||
      sessionData.correctCount !== sessionData.totalQuestions
    ) {
      throw new Error("Chỉ có thể lưu hoàn thành khi trả lời đúng toàn bộ câu hỏi.");
    }
    const result = await grammarApi.submitSessionProgress({
      ...sessionData,
      isCompleted: true,
    });
    if (!result.progress.is_mastered) {
      throw new Error("Máy chủ chưa xác nhận hoàn thành chuyên đề.");
    }
    return result;
  },

  getUserProgress: (userId: string): Promise<GrammarProgressRecord[]> =>
    requestData(
      axiosClient.get(ENDPOINTS.GRAMMAR.GET_USER_PROGRESS(userId)),
    ),

  importFullSubTopic: (payload: unknown) =>
    requestData<DbSubTopic & { stages: unknown[] }>(
      axiosClient.post(ENDPOINTS.GRAMMAR.ADMIN_IMPORT_FULL_SUB_TOPIC, payload),
    ),
};
