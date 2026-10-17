import { useState } from 'react';
import { useGameSound } from '../../hooks/useGameSound';
import GameHeader from '../shared/GameHeader';
import GameOverModal from '../shared/GameOverModal';
import VictoryModal from '../shared/VictoryModal';
import WordBlock from '../shared/WordBlock';
import GameReward from '../shared/GameReward';
import type { CampaignAnswer, GameStageResult } from '../../types/gameAnalytics';
import { shuffleItems } from '../../utils/shuffleItems';
import type { TransformerQuestion } from '../../types/grammarData';
import EmptyGameState from '../shared/EmptyGameState';

interface SentenceTransformerGameProps {
  onBack?: () => void;
  onComplete?: (result: GameStageResult) => void;
  onAnswer?: (answer: CampaignAnswer) => void;
  questions?: TransformerQuestion[];
  stageTitle?: string;
  stageId?: string;
  subTopicTitle?: string;
  initialLives?: number;
}

const createAvailableBlocks = (question: TransformerQuestion): string[] =>
  shuffleItems([...question.correctBlocks, ...question.distractorBlocks]);

export default function SentenceTransformerGame({ onBack, onComplete, onAnswer, questions = [], stageTitle, stageId = 'transformer', subTopicTitle = stageTitle ?? 'Ngữ pháp', initialLives = 5 }: SentenceTransformerGameProps) {
  const { playSelect, playCorrect, playIncorrect, playGameOver, playVictory } = useGameSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const [availableBlocks, setAvailableBlocks] = useState<string[]>(() =>
    questions[0] ? createAvailableBlocks(questions[0]) : [],
  );
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');

  // Modals state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentQ = questions[currentIndex];

  if (!currentQ) return <EmptyGameState onBack={onBack} />;

  const handleSelectBlock = (block: string, index: number) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setAvailableBlocks(prev => prev.filter((_, i) => i !== index));
    setSelectedBlocks(prev => [...prev, block]);
  };

  const handleRemoveBlock = (block: string, index: number) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setSelectedBlocks(prev => prev.filter((_, i) => i !== index));
    setAvailableBlocks(prev => [...prev, block]);
  };

  const handleCheckAnswer = () => {
    if (selectedBlocks.length === 0 || status !== 'playing' || isGameOver) return;

    const userSentence = selectedBlocks.join(' ').replace(/\s+/g, ' ').trim();
    const correctSentence = currentQ.correctBlocks.join(' ').replace(/\s+/g, ' ').trim();
    const isCorrect = userSentence === correctSentence;
    onAnswer?.({
      stageId,
      subTopicTitle,
      questionId: currentQ.id,
      prompt: `${currentQ.originalSentence} · ${currentQ.targetPrompt}`,
      correctAnswer: correctSentence,
      submittedAnswer: userSentence,
      isCorrect
    });

    if (isCorrect) {
      playCorrect();
      setStatus('correct');
      setXp(prev => prev + 30 + streak * 5);
      setStreak(prev => prev + 1);
    } else {
      playIncorrect();
      setStatus('incorrect');
      setStreak(0);
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);

      if (nextLives === 0) {
        playGameOver();
        setIsGameOver(true);
      }
    }
  };

  const handleNext = () => {
    playSelect();
    if (currentIndex < questions.length - 1) {
      const nextQuestion = questions[currentIndex + 1];
      setAvailableBlocks(createAvailableBlocks(nextQuestion));
      setSelectedBlocks([]);
      setStatus('playing');
      setCurrentIndex(prev => prev + 1);
    } else {
      playVictory();
      setIsVictory(true);
    }
  };

  const handleRetryGame = () => {
    playSelect();
    setLives(initialLives);
    setXp(0);
    setStreak(0);
    setCurrentIndex(0);
    setAvailableBlocks(createAvailableBlocks(questions[0]));
    setSelectedBlocks([]);
    setStatus('playing');
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <div className={`grammar-game min-h-dvh overflow-x-clip bg-gradient-to-br from-indigo-50 via-purple-50/20 to-teal-50/30 text-slate-800 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:p-8 font-sans flex flex-col justify-between ${status === 'incorrect' ? 'animate-shake' : ''}`}>
      <div className="max-w-3xl min-w-0 mx-auto w-full space-y-6">

        {/* --- HEADER --- */}
        <GameHeader 
          onBack={onBack}
          lives={lives}
          xp={xp}
          streak={streak}
          title={stageTitle ?? 'Biến Đổi Câu (Sentence Transformer)'}
          currentStep={currentIndex + 1}
          totalSteps={questions.length}
        />

        {/* --- GAME CARD CHÍNH --- */}
        <div className="game-card min-w-0 bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-indigo-200/40 space-y-6">
          
          <div className="space-y-3 text-center">
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm">
              Viết lại câu không đổi nghĩa
            </span>
            <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-inner">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Câu gốc:</p>
              <p className="text-base md:text-lg font-black text-slate-800">
                "{currentQ.originalSentence}"
              </p>
            </div>
            <p className="text-xs font-extrabold text-indigo-600 bg-indigo-50 inline-block px-3.5 py-1.5 rounded-full border border-indigo-100">
              Gợi ý bắt đầu: <span className="underline">{currentQ.targetPrompt}</span>
            </p>
          </div>

          {/* KHAY TRẢ LỜI (Dropzone) */}
          <div className="min-h-[120px] min-w-0 bg-slate-50/80 border-2 border-dashed border-indigo-300 rounded-3xl p-3 sm:p-5 flex flex-wrap gap-2.5 items-center content-start shadow-inner">
            {selectedBlocks.length === 0 ? (
              <p className="text-slate-400 text-sm font-bold w-full text-center py-6 animate-pulse">
                👇 Chạm vào các khối từ bên dưới để hoàn thiện câu mới nhé!
              </p>
            ) : (
              selectedBlocks.map((block, idx) => (
                <WordBlock 
                  key={idx} 
                  text={block} 
                  variant="indigo" 
                  animation="pop-in"
                  onClick={() => handleRemoveBlock(block, idx)} 
                />
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-2"></div>

          {/* KHO CÁC CỤM TỪ LỰA CHỌN */}
          <div className="flex flex-wrap gap-3 justify-center py-2">
            {availableBlocks.map((block, idx) => (
              <WordBlock 
                key={idx} 
                text={block} 
                variant="default" 
                animation="pop-in"
                onClick={() => handleSelectBlock(block, idx)} 
              />
            ))}
          </div>

        </div>

      </div>

      {/* --- FOOTER ACTION & FEEDBACK --- */}
      <div className="max-w-3xl mx-auto w-full mt-6">
        {status === 'playing' && (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedBlocks.length === 0}
            className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all text-base flex items-center justify-center gap-2 ${
              selectedBlocks.length > 0 
                ? 'bg-indigo-500 hover:bg-indigo-600 active:translate-y-1 border-b-4 border-indigo-700 text-white cursor-pointer shadow-indigo-200' 
                : 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
            }`}
          >
            Biến đổi câu
          </button>
        )}

        {status === 'correct' && (
          <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between animate-bounce-short border-2 border-emerald-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🪄
              </div>
              <div>
                <h4 className="font-black text-lg">Chính xác rồi!</h4>
                <p className="text-xs text-emerald-100 font-bold">+{30 + Math.max(0, streak - 1) * 5} điểm · {streak > 1 ? `COMBO x${streak}` : 'Bắt đầu chuỗi thắng!'} · {currentQ.explanation}</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="px-7 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Tiếp tục
            </button>
          </div>
        )}

        {status === 'incorrect' && (
          <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-rose-400 animate-shake">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🙈
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-lg">Cấu trúc chưa đúng rồi!</h4>
                <p className="text-xs text-rose-100 font-medium">Gợi ý chuẩn: "{currentQ.correctBlocks.join(' ')}"</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full md:w-auto shrink-0 px-6 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Câu tiếp theo
            </button>
          </div>
        )}
      </div>

      {status === 'correct' && <GameReward xp={30 + Math.max(0, streak - 1) * 5} streak={streak} />}

      <GameOverModal 
        isOpen={isGameOver} 
        onRetry={handleRetryGame} 
        onExit={onBack || (() => {})} 
      />

      <VictoryModal 
        isOpen={isVictory} 
        xpEarned={xp} 
        onNext={() => onComplete ? onComplete({ xpEarned: xp, livesRemaining: lives }) : onBack?.()} 
        onReplay={handleRetryGame}
      />
    </div>
  );
}