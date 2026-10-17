import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type GameStage
} from '../types/grammarData';
import './shared/game-animation.css';
import SentencePuzzleGame from './screens/SentencePuzzleGame';
import ErrorSpotterGame from './screens/ErrorSpotterGame';
import SpeedGrammarQuiz from './screens/SpeedGrammarQuiz';
import SentenceTransformerGame from './screens/SentenceTransformerGame';
import ContextMatchGame from './screens/ContextMatchGame';
import CampaignVictorySummary from './screens/CampaignVictorySummary';
import type { CampaignAnswer, GameStageResult, SessionIntensity } from '../types/gameAnalytics';
import { grammarApi } from '../api/grammarApi';
import type { GrammarProgressRecord } from '../types/grammarApi';

interface GrammarCampaignSessionProps {
  onExitSession?: () => void;
  onSubTopicsPassed?: (subTopicIds: string[]) => void;
  onSubTopicProgressSaved?: (progress: GrammarProgressRecord) => void;
  completableSubTopicIds?: string[];
  stages?: GameStage[];
  intensity?: SessionIntensity;
}

export default function GrammarCampaignSession({
  onExitSession,
  onSubTopicsPassed,
  onSubTopicProgressSaved,
  completableSubTopicIds = [],
  stages = [],
  intensity = 'standard'
}: GrammarCampaignSessionProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [sessionLives, setSessionLives] = useState(5);
  const [answers, setAnswers] = useState<CampaignAnswer[]>([]);
  const [summary, setSummary] = useState<{ livesRemaining: number; elapsedSeconds: number } | null>(null);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSavedXp, setProgressSavedXp] = useState<number | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const answersRef = useRef<CampaignAnswer[]>([]);
  const savedSubTopicsRef = useRef(new Set<string>());
  const failedSubTopicsRef = useRef(new Set<string>());
  const pendingSubTopicsRef = useRef(new Set<string>());
  const sessionStartedAt = useRef<number | null>(null);
  const currentStage = stages[currentStageIndex];

  useEffect(() => {
    sessionStartedAt.current = Date.now();
  }, []);

  const saveSubTopicProgress = async (subTopicId: string) => {
    if (
      savedSubTopicsRef.current.has(subTopicId) ||
      pendingSubTopicsRef.current.has(subTopicId)
    ) {
      return;
    }

    const lessonStages = stages.filter(stage => stage.subTopicId === subTopicId);
    const totalQuestions = lessonStages.reduce(
      (total, stage) => total + stage.questions.length,
      0,
    );
    if (totalQuestions === 0) {
      failedSubTopicsRef.current.add(subTopicId);
      setProgressError('Không có dữ liệu câu hỏi để lưu tiến độ chuyên đề.');
      return;
    }

    const answeredCorrectly = new Set(
      answersRef.current
        .filter(answer => answer.isCorrect)
        .map(answer => `${answer.stageId}:${answer.questionId}`),
    );
    const correctCount = lessonStages.reduce(
      (total, stage) =>
        total + stage.questions.filter(question =>
          answeredCorrectly.has(`${stage.id}:${question.id}`),
        ).length,
      0,
    );
    const firstStage = lessonStages[0];
    const passed =
      completableSubTopicIds.includes(subTopicId) &&
      correctCount === totalQuestions;
    const payload = {
      topicId: firstStage.topicId,
      subTopicId,
      correctCount,
      totalQuestions,
      score: Math.round((correctCount / totalQuestions) * 100),
      isCompleted: passed,
    };

    if (passed) onSubTopicsPassed?.([subTopicId]);
    failedSubTopicsRef.current.delete(subTopicId);
    pendingSubTopicsRef.current.add(subTopicId);
    setProgressSaving(true);
    try {
      const result = passed
        ? await grammarApi.saveSubTopicCompletion(payload)
        : await grammarApi.submitSessionProgress(payload);
      savedSubTopicsRef.current.add(subTopicId);
      onSubTopicProgressSaved?.(result.progress);
      setProgressSavedXp(current => (current ?? 0) + result.xpGained);
      if (failedSubTopicsRef.current.size === 0) setProgressError(null);
    } catch (error) {
      failedSubTopicsRef.current.add(subTopicId);
      setProgressError(
        error instanceof Error ? error.message : 'Không thể lưu tiến độ luyện tập.',
      );
    } finally {
      pendingSubTopicsRef.current.delete(subTopicId);
      setProgressSaving(pendingSubTopicsRef.current.size > 0);
    }
  };

  const retryFailedProgress = () => {
    for (const subTopicId of failedSubTopicsRef.current) {
      void saveSubTopicProgress(subTopicId);
    }
  };

  const handleAnswer = useCallback((answer: CampaignAnswer) => {
    const nextAnswers = [...answersRef.current, answer];
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
  }, []);

  const handleStageComplete = (result: GameStageResult) => {
    setSessionLives(result.livesRemaining);
    const completedStage = currentStage;
    if (
      completedStage &&
      !stages.slice(currentStageIndex + 1).some(
        stage => stage.subTopicId === completedStage.subTopicId,
      )
    ) {
      void saveSubTopicProgress(completedStage.subTopicId);
    }
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(index => index + 1);
    } else {
      setSummary({
        livesRemaining: result.livesRemaining,
        elapsedSeconds: Math.max(0, Math.floor((Date.now() - (sessionStartedAt.current ?? Date.now())) / 1000))
      });
    }
  };

  if (summary) {
    return (
      <>
        {(progressSaving || progressError || progressSavedXp !== null) && (
          <div className={`fixed left-1/2 top-4 z-[80] w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-lg ${
            progressError
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}>
            {progressSaving
              ? 'Đang lưu tiến độ học tập...'
              : progressError
                ? <>{progressError} <button type="button" onClick={retryFailedProgress} className="ml-2 underline">Thử lại</button></>
                : `Đã lưu tiến độ và cộng ${progressSavedXp} XP.`}
          </div>
        )}
        <CampaignVictorySummary
          xpEarned={progressSavedXp}
          livesRemaining={summary.livesRemaining}
          elapsedSeconds={summary.elapsedSeconds}
          intensity={intensity}
          answers={answers}
          xpSaving={progressSaving}
          xpSaveFailed={Boolean(progressError)}
          onExit={onExitSession ?? (() => {})}
        />
      </>
    );
  }

  if (!currentStage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 p-6">
        <section className="max-w-md rounded-3xl border-2 border-white bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-slate-800">Chưa có chặng luyện tập</h1>
          <p className="mt-2 text-sm text-slate-500">Hãy chọn ít nhất một chuyên đề có bài tập để bắt đầu.</p>
          <button
            type="button"
            onClick={onExitSession}
            className="mt-5 rounded-2xl border-b-4 border-slate-300 bg-slate-100 px-5 py-3 font-black text-slate-700 active:translate-y-1 active:border-b-0"
          >
            Về bản đồ
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/70 via-white to-sky-50/70 animate-pop-in" aria-live="polite">
      {progressError && (
        <div role="alert" className="fixed left-1/2 top-4 z-[90] flex w-[min(92vw,560px)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 shadow-lg">
          <span>{progressError}</span>
          <button type="button" onClick={retryFailedProgress} className="shrink-0 underline">Thử lại</button>
        </div>
      )}
      {currentStage.type === 'puzzle' && (
        <SentencePuzzleGame
          key={`${currentStage.id}-${currentStageIndex}`}
          questions={currentStage.questions}
          stageTitle={currentStage.title}
          stageId={currentStage.id}
          subTopicTitle={currentStage.subTopicTitle}
          initialLives={sessionLives}
          onAnswer={handleAnswer}
          onBack={onExitSession}
          onComplete={handleStageComplete}
        />
      )}
      {currentStage.type === 'error' && (
        <ErrorSpotterGame
          key={`${currentStage.id}-${currentStageIndex}`}
          questions={currentStage.questions}
          stageTitle={currentStage.title}
          stageId={currentStage.id}
          subTopicTitle={currentStage.subTopicTitle}
          initialLives={sessionLives}
          onAnswer={handleAnswer}
          onBack={onExitSession}
          onComplete={handleStageComplete}
        />
      )}
      {currentStage.type === 'speed' && (
        <SpeedGrammarQuiz
          key={`${currentStage.id}-${currentStageIndex}`}
          questions={currentStage.questions}
          stageTitle={currentStage.title}
          stageId={currentStage.id}
          subTopicTitle={currentStage.subTopicTitle}
          initialLives={sessionLives}
          onAnswer={handleAnswer}
          onBack={onExitSession}
          onComplete={handleStageComplete}
        />
      )}
      {currentStage.type === 'transformer' && (
        <SentenceTransformerGame
          key={`${currentStage.id}-${currentStageIndex}`}
          questions={currentStage.questions}
          stageTitle={currentStage.title}
          stageId={currentStage.id}
          subTopicTitle={currentStage.subTopicTitle}
          initialLives={sessionLives}
          onAnswer={handleAnswer}
          onBack={onExitSession}
          onComplete={handleStageComplete}
        />
      )}
      {currentStage.type === 'context' && (
        <ContextMatchGame
          key={`${currentStage.id}-${currentStageIndex}`}
          questions={currentStage.questions}
          stageTitle={currentStage.title}
          stageId={currentStage.id}
          subTopicTitle={currentStage.subTopicTitle}
          initialLives={sessionLives}
          onAnswer={handleAnswer}
          onBack={onExitSession}
          onComplete={handleStageComplete}
        />
      )}
    </div>
  );
}
