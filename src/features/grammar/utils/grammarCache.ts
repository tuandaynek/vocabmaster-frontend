import type { GrammarProgressRecord } from '../types/grammarApi';
import type { GameType, GrammarTopic, SubTopic } from '../types/grammarData';
import { GRAMMAR_GAME_TYPES } from '../constants/grammarConstants';
import type {
  CachedSubTopic,
  CachedTopic,
  GrammarCurriculumCache,
  GrammarProgressCache,
} from '../types/grammarCache';

const EMPTY_THEORY: SubTopic['theory'] = {
  formulas: [],
  usageSignals: [],
  examples: [],
  traps: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isGameType = (value: unknown): value is GameType =>
  typeof value === 'string' &&
  GRAMMAR_GAME_TYPES.some(gameType => gameType === value);

export const curriculumCacheKey = (userId: string) =>
  `grammar_curriculum_cache:${userId}`;

export const progressCacheKey = (userId: string) =>
  `grammar_progress_cache:${userId}`;

const isCurriculumCache = (
  value: unknown,
  userId: string,
): value is GrammarCurriculumCache =>
  isRecord(value) &&
  value.version === 1 &&
  value.userId === userId &&
  Array.isArray(value.topics) &&
  value.topics.every((topic: unknown): topic is CachedTopic =>
    isRecord(topic) &&
    typeof topic.id === 'string' &&
    typeof topic.title === 'string' &&
    (typeof topic.category === 'string' || topic.category === null) &&
    (typeof topic.description === 'string' || topic.description === null) &&
    typeof topic.level === 'string' &&
    isFiniteNumber(topic.progress) &&
    typeof topic.isLocked === 'boolean' &&
    typeof topic.badgeColor === 'string' &&
    typeof topic.iconBg === 'string' &&
    Array.isArray(topic.subTopics) &&
    topic.subTopics.every((subTopic: unknown): subTopic is CachedSubTopic =>
      isRecord(subTopic) &&
      typeof subTopic.id === 'string' &&
      typeof subTopic.topicId === 'string' &&
      typeof subTopic.title === 'string' &&
      typeof subTopic.description === 'string' &&
      isFiniteNumber(subTopic.orderIndex) &&
      isStringArray(subTopic.gameStageIds) &&
      Array.isArray(subTopic.stages) &&
      subTopic.stages.every((stage: unknown) =>
        isRecord(stage) &&
        typeof stage.id === 'string' &&
        isGameType(stage.type) &&
        isFiniteNumber(stage.questionCount),
      ) &&
      isFiniteNumber(subTopic.progress) &&
      typeof subTopic.isMastered === 'boolean' &&
      typeof subTopic.isLocked === 'boolean' &&
      !('theory' in subTopic),
    ),
  );

const isGrammarProgressCache = (value: unknown): value is GrammarProgressCache =>
  isRecord(value) &&
  isStringArray(value.learnedSubTopicIds) &&
  isStringArray(value.completedSubTopicIds);

const readCache = <T,>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | null => {
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    localStorage.removeItem(key);
    return null;
  }

  if (!isValid(parsed)) {
    localStorage.removeItem(key);
    return null;
  }
  return parsed;
};

export const readCurriculumCache = (userId: string) =>
  readCache<GrammarCurriculumCache>(
    curriculumCacheKey(userId),
    value => isCurriculumCache(value, userId),
  );

export const readProgressCache = (userId: string) =>
  readCache<GrammarProgressCache>(
    progressCacheKey(userId),
    isGrammarProgressCache,
  );

const toCachedSubTopic = (subTopic: SubTopic): CachedSubTopic => ({
  id: subTopic.id,
  topicId: subTopic.topicId,
  title: subTopic.title,
  description: subTopic.description,
  orderIndex: subTopic.orderIndex,
  gameStageIds: subTopic.gameStageIds,
  stages: subTopic.stages,
  progress: subTopic.progress,
  isMastered: subTopic.isMastered,
  isLocked: subTopic.isLocked,
});

export const toCachedTopics = (topics: GrammarTopic[]): CachedTopic[] =>
  topics.map(({ subTopics, ...topic }) => ({
    ...topic,
    subTopics: subTopics.map(toCachedSubTopic),
  }));

export const fromCachedTopics = (topics: CachedTopic[]): GrammarTopic[] =>
  topics.map(topic => ({
    ...topic,
    subTopics: topic.subTopics.map(subTopic => ({
      ...subTopic,
      theory: EMPTY_THEORY,
    })),
  }));

export const progressCacheFromRecords = (
  records: GrammarProgressRecord[],
): GrammarProgressCache => ({
  learnedSubTopicIds: [...new Set(records.map(record => record.sub_topic_id))],
  completedSubTopicIds: [
    ...new Set(records.filter(record => record.is_mastered).map(record => record.sub_topic_id)),
  ],
});

export const mergeProgressCache = (
  current: GrammarProgressCache,
  learnedIds: string[],
  completedIds: string[],
): GrammarProgressCache => ({
  learnedSubTopicIds: [...new Set([...current.learnedSubTopicIds, ...learnedIds])],
  completedSubTopicIds: [...new Set([...current.completedSubTopicIds, ...completedIds])],
});
