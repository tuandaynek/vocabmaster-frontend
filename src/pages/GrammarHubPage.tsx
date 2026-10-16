import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../features/grammar/components/shared/game-animation.css';
import {
  ArrowLeft,
  BookOpen,
  Trophy
} from 'lucide-react';
import { useGameSound } from '../features/grammar/hooks/useGameSound';
import GrammarCampaignSession from '../features/grammar/components/GrammarCampaignSession';
import GrammarTopicMap from '../features/grammar/components/screens/GrammarTopicMap';
import TopicDetailModal from '../features/grammar/components/screens/TopicDetailModal';
import TheoryPage from '../features/grammar/components/screens/TheoryPage';
import SessionCustomizerModal from '../features/grammar/components/screens/SessionCustomizerModal';
import type { SessionIntensity } from '../features/grammar/types/gameAnalytics';
import {
  type GameStage,
  type GrammarTopic,
  type SubTopic
} from '../features/grammar/types/grammarData';
import { grammarApi } from '@/features/grammar/api/grammarApi';
import type { GrammarProgressRecord } from '@/features/grammar/types/grammarApi';
import { useGrammarHubData } from '@/features/grammar/hooks/useGrammarHubData';
import { useAuthStore } from '@/features/auth/stores/authStore';

type GrammarView = 'hub' | 'detail' | 'theory' | 'campaign';

export default function GrammarHubPage() {
  const { playSelect } = useGameSound();
  const userId = useAuthStore(state => state.user?.id);
  const {
    topics,
    progressCache,
    topicsLoading,
    dataError,
    loadGrammarData,
    updateProgressCache,
  } = useGrammarHubData(userId);
  const [topicLoading, setTopicLoading] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<GrammarView>('hub');
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null);
  const [selectedSubTopics, setSelectedSubTopics] = useState<SubTopic[]>([]);
  const [activeStages, setActiveStages] = useState<GameStage[]>([]);
  const [completableSubTopicIds, setCompletableSubTopicIds] = useState<string[]>([]);
  const [customizerStages, setCustomizerStages] = useState<GameStage[]>([]);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [activeIntensity, setActiveIntensity] = useState<SessionIntensity>('standard');

  const progressCount = {
    learned: progressCache.learnedSubTopicIds.length,
    mastered: progressCache.completedSubTopicIds.length,
  };

  const handleSubTopicsPassed = (subTopicIds: string[]) => {
    updateProgressCache(subTopicIds, subTopicIds);
  };

  const handleSubTopicProgressSaved = (progress: GrammarProgressRecord) => {
    updateProgressCache(
      [progress.sub_topic_id],
      progress.is_mastered ? [progress.sub_topic_id] : [],
    );
  };

  const handleOpenTopic = (topic: GrammarTopic) => {
    if (topic.isLocked) return;
    playSelect();
    setActionError(null);
    const completedIds = new Set(progressCache.completedSubTopicIds);
    setActiveTopic({
      ...topic,
      subTopics: topic.subTopics.map(subTopic => ({
        ...subTopic,
        isMastered: completedIds.has(subTopic.id) || subTopic.isMastered,
      })),
    });
    setCurrentView('detail');
  };

  const handleChooseTheory = async (subTopics: SubTopic[]) => {
    setTopicLoading(true);
    setActionError(null);
    try {
      const completedIds = new Set(progressCache.completedSubTopicIds);
      const loadedSubTopics = await Promise.all(subTopics.map(async subTopic => {
        const detail = await grammarApi.getSubTopicDetail(subTopic.id);
        return {
          ...detail,
          progress: subTopic.progress,
          isMastered: completedIds.has(subTopic.id) || subTopic.isMastered,
          isLocked: subTopic.isLocked,
        };
      }));
      setSelectedSubTopics(loadedSubTopics);
      setCurrentView('theory');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể tải lý thuyết.');
    } finally {
      setTopicLoading(false);
    }
  };

  const handleStartPractice = async (subTopics: SubTopic[]) => {
    setPracticeLoading(true);
    setActionError(null);
    try {
      const stageGroups = await Promise.all(
        subTopics.map(subTopic =>
          grammarApi.getStagesBySubTopic(subTopic.id, subTopic.topicId, subTopic.title),
        ),
      );
      const stages = stageGroups.flat();
      if (stages.length === 0) {
        setActionError('Các chuyên đề đã chọn hiện chưa có chặng luyện tập.');
        return;
      }
      setCustomizerStages(stages);
      setIsCustomizerOpen(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể tải câu hỏi luyện tập.');
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleConfirmPractice = (stages: GameStage[], intensity: SessionIntensity) => {
    const selectedQuestionIds = new Set(
      stages.flatMap(stage => stage.questions.map(question => `${stage.id}:${question.id}`)),
    );
    const fullyCoveredSubTopicIds = [...new Set(customizerStages.map(stage => stage.subTopicId))]
      .filter(subTopicId => {
        const questions = customizerStages
          .filter(stage => stage.subTopicId === subTopicId)
          .flatMap(stage => stage.questions.map(question => `${stage.id}:${question.id}`));
        return questions.length > 0 && questions.every(questionId => selectedQuestionIds.has(questionId));
      });
    setCompletableSubTopicIds(fullyCoveredSubTopicIds);
    setActiveStages(stages);
    setActiveIntensity(intensity);
    setIsCustomizerOpen(false);
    setCurrentView('campaign');
  };

  const handleExitToHub = () => {
    setCurrentView('hub');
    setActiveTopic(null);
    setSelectedSubTopics([]);
    setActiveStages([]);
    setCompletableSubTopicIds([]);
    setIsCustomizerOpen(false);
    setCustomizerStages([]);
    setActionError(null);
  };

  if (currentView === 'campaign') {
    return (
      <GrammarCampaignSession
        key={activeTopic?.id ?? 'campaign'}
        stages={activeStages}
        intensity={activeIntensity}
        onSubTopicsPassed={handleSubTopicsPassed}
        onSubTopicProgressSaved={handleSubTopicProgressSaved}
        completableSubTopicIds={completableSubTopicIds}
        onExitSession={handleExitToHub}
      />
    );
  }

  if (currentView === 'theory') {
    return (
      <>
      {actionError && (
        <div role="alert" className="fixed left-1/2 top-4 z-[70] w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 shadow-lg">
          {actionError}
        </div>
      )}
      <TheoryPage
        subTopics={selectedSubTopics}
        onBackToHub={handleExitToHub}
        onStartPractice={() => handleStartPractice(selectedSubTopics)}
      />
      {isCustomizerOpen && (
        <SessionCustomizerModal
          stages={customizerStages}
          loading={practiceLoading}
          error={actionError}
          onClose={() => setIsCustomizerOpen(false)}
          onStart={handleConfirmPractice}
        />
      )}
      </>
    );
  }

  return (
    <div className="grammar-hub min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/10 to-teal-50/20 p-4 font-sans text-slate-800 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8 animate-pop-in">
        <header className="flex flex-col items-center justify-between gap-4 rounded-3xl border-2 border-white bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-md md:flex-row md:p-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-slate-100 bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Link>
            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-black text-slate-800">
                Grammar Quest
              </h1>
              <p className="text-xs font-medium text-slate-500">Tự học và vận dụng ngữ pháp</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-extrabold text-sky-700">
              <BookOpen className="h-5 w-5 text-sky-500" />
              <span>{progressCount.learned} Bài đã học</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-extrabold text-emerald-700">
              <Trophy className="h-5 w-5 text-emerald-500" />
              <span>{progressCount.mastered} Đã thành thạo</span>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white shadow-xl shadow-emerald-500/15">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              Làm chủ ngữ pháp
            </span>
            <h2 className="text-2xl font-black md:text-3xl">Các bài tập từ cơ bản đến nâng cao</h2>
            <p className="text-sm font-medium text-emerald-50 md:text-base">
              Chọn chủ đề, học quy tắc theo từng chuyên đề hoặc luyện tập qua các chặng game ngắn.
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/20 blur-xl" />
        </section>

        <GrammarTopicMap
          topics={topics}
          loading={topicsLoading}
          dataError={dataError}
          actionError={actionError}
          onRetry={() => void loadGrammarData()}
          onSelectTopic={handleOpenTopic}
        />
      </div>

      {topicLoading && (
        <div role="status" className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-6">
          <div className="rounded-2xl bg-white px-6 py-4 font-bold text-slate-700 shadow-xl">Đang tải chuyên đề...</div>
        </div>
      )}
      {currentView === 'detail' && activeTopic && !topicLoading && (
        <TopicDetailModal
          topic={{
            ...activeTopic,
            subTopics: activeTopic.subTopics.map(subTopic => ({
              ...subTopic,
              isMastered:
                progressCache.completedSubTopicIds.includes(subTopic.id) ||
                subTopic.isMastered,
            })),
          }}
          loading={practiceLoading}
          error={actionError}
          onClose={handleExitToHub}
          onChooseTheory={handleChooseTheory}
          onStartPractice={handleStartPractice}
        />
      )}
      {isCustomizerOpen && (
        <SessionCustomizerModal
          stages={customizerStages}
          loading={practiceLoading}
          error={actionError}
          onClose={() => setIsCustomizerOpen(false)}
          onStart={handleConfirmPractice}
        />
      )}
    </div>
  );
}
