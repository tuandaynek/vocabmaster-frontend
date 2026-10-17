import { useCallback, useEffect, useRef, useState } from 'react';
import { grammarApi } from '../api/grammarApi';
import type { GrammarTopic } from '../types/grammarData';
import type { GrammarProgressCache } from '../types/grammarCache';
import {
  curriculumCacheKey,
  fromCachedTopics,
  mergeProgressCache,
  progressCacheFromRecords,
  progressCacheKey,
  readCurriculumCache,
  readProgressCache,
  toCachedTopics,
} from '../utils/grammarCache';

const EMPTY_PROGRESS: GrammarProgressCache = {
  learnedSubTopicIds: [],
  completedSubTopicIds: [],
};

export function useGrammarHubData(userId: string | undefined) {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [progressCache, setProgressCache] = useState(EMPTY_PROGRESS);
  const progressCacheRef = useRef(progressCache);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadGrammarData = useCallback(async () => {
    setTopicsLoading(true);
    setDataError(null);
    try {
      if (!userId) {
        throw new Error('Cần đăng nhập để tải tiến độ Grammar Quest.');
      }

      const cachedCurriculum = readCurriculumCache(userId);
      const loadedTopics = cachedCurriculum
        ? fromCachedTopics(cachedCurriculum.topics)
        : await grammarApi.getTopics();

      if (!cachedCurriculum) {
        const curriculumCache = {
          version: 1 as const,
          userId,
          topics: toCachedTopics(loadedTopics),
        };
        try {
          localStorage.setItem(
            curriculumCacheKey(),
            JSON.stringify(curriculumCache),
          );
        } catch (error) {
          setDataError(
            error instanceof Error
              ? error.message
              : 'Không thể lưu chương trình học cục bộ.',
          );
        }
      }

      const cachedProgress = readProgressCache(userId);
      const loadedProgress = cachedProgress ?? progressCacheFromRecords(
        await grammarApi.getUserProgress(userId),
      );

      setTopics(loadedTopics);
      progressCacheRef.current = loadedProgress;
      setProgressCache(loadedProgress);
      if (!cachedProgress) {
        try {
          localStorage.setItem(
            progressCacheKey(userId),
            JSON.stringify(loadedProgress),
          );
        } catch (error) {
          setDataError(
            error instanceof Error
              ? error.message
              : 'Không thể lưu tiến độ cục bộ.',
          );
        }
      }
    } catch (error) {
      setDataError(
        error instanceof Error
          ? error.message
          : 'Không thể tải dữ liệu Grammar Quest.',
      );
    } finally {
      setTopicsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadGrammarData();
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadGrammarData]);

  const updateProgressCache = useCallback(
    (learnedIds: string[], completedIds: string[]) => {
      const next = mergeProgressCache(
        progressCacheRef.current,
        learnedIds,
        completedIds,
      );
      progressCacheRef.current = next;
      setProgressCache(next);
      if (!userId) return;

      try {
        localStorage.setItem(progressCacheKey(userId), JSON.stringify(next));
      } catch (error) {
        setDataError(
          error instanceof Error
            ? error.message
            : 'Không thể lưu tiến độ cục bộ.',
        );
      }
    },
    [userId],
  );

  return {
    topics,
    progressCache,
    topicsLoading,
    dataError,
    loadGrammarData,
    updateProgressCache,
  };
}
