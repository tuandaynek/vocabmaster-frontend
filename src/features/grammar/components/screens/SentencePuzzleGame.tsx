import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useGameSound } from '../../hooks/useGameSound';
import GameHeader from '../shared/GameHeader';
import GameOverModal from '../shared/GameOverModal';
import VictoryModal from '../shared/VictoryModal';
import WordBlock from '../shared/WordBlock';
import GameReward from '../shared/GameReward';
import type { CampaignAnswer, GameStageResult } from '../../types/gameAnalytics';
import { shuffleItems } from '../../utils/shuffleItems';
import type { PuzzleQuestion } from '../../types/grammarData';
import EmptyGameState from '../shared/EmptyGameState';

interface WordItem {
  id: string;
  text: string;
}

interface SentencePuzzleGameProps {
  onBack?: () => void;
  onComplete?: (result: GameStageResult) => void;
  onAnswer?: (answer: CampaignAnswer) => void;
  questions?: PuzzleQuestion[];
  stageTitle?: string;
  stageId?: string;
  subTopicTitle?: string;
  initialLives?: number;
}

const createWordPool = (question: PuzzleQuestion): WordItem[] =>
  shuffleItems(question.correctSentence.map((word, idx) => ({
    id: `${word}-${idx}-${Math.random()}`,
    text: word
  })));

export default function SentencePuzzleGame({ onBack, onComplete, onAnswer, questions = [], stageTitle, stageId = 'puzzle', subTopicTitle = stageTitle ?? 'Ngữ pháp', initialLives = 5 }: SentencePuzzleGameProps) {
  const { playSelect, playCorrect, playIncorrect, playGameOver, playVictory } = useGameSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [poolWords, setPoolWords] = useState<WordItem[]>(() =>
    questions[0] ? createWordPool(questions[0]) : [],
  );
  const [selectedWords, setSelectedWords] = useState<WordItem[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');
  
  // Modals state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentQ = questions[currentIndex];

  if (!currentQ) return <EmptyGameState onBack={onBack} />;

  const handleSelectWord = (item: WordItem) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setPoolWords(poolWords.filter(w => w.id !== item.id));
    setSelectedWords([...selectedWords, item]);
  };

  const handleRemoveWord = (item: WordItem) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setSelectedWords(selectedWords.filter(w => w.id !== item.id));
    setPoolWords([...poolWords, item]);
  };

  const handleCheckAnswer = () => {
    if (selectedWords.length === 0 || status !== 'playing' || isGameOver) return;

    const userSentence = selectedWords.map(w => w.text).join(' ');
    const targetSentence = currentQ.correctSentence.join(' ');
    const isCorrect = userSentence === targetSentence;
    onAnswer?.({
      stageId,
      subTopicTitle,
      questionId: currentQ.id,
      prompt: currentQ.vietnamesePrompt,
      correctAnswer: targetSentence,
      submittedAnswer: userSentence,
      isCorrect
    });

    if (isCorrect) {
      playCorrect();
      setStatus('correct');
      setXp(prev => prev + 25 + streak * 5);
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
      setPoolWords(createWordPool(nextQuestion));
      setSelectedWords([]);
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
    setPoolWords(createWordPool(questions[0]));
    setSelectedWords([]);
    setStatus('playing');
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <div className={`grammar-game min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50/20 to-teal-50/30 text-slate-800 p-4 md:p-8 font-sans flex flex-col justify-between ${status === 'incorrect' ? 'animate-shake' : ''}`}>
      <div className="max-w-3xl mx-auto w-full space-y-6">

        {/* --- HEADER DÙNG CHUNG --- */}
        <GameHeader 
          onBack={onBack}
          lives={lives}
          xp={xp}
          streak={streak}
          title={stageTitle ?? 'Ghép Khối Từ (Sentence Puzzle)'}
          currentStep={currentIndex + 1}
          totalSteps={questions.length}
        />

        {/* --- GAME CARD CHÍNH --- */}
        <div className="game-card bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-200/40 space-y-6">
          
          <div className="space-y-3 text-center">
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm">
              Sắp xếp câu hoàn chỉnh từ các từ xáo trộn
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              "{currentQ.vietnamesePrompt}"
            </h2>
          </div>

          {/* KHAY TRẢ LỜI (Drop Zone) */}
          <div className="min-h-[120px] bg-slate-50/80 border-2 border-dashed border-emerald-300 rounded-3xl p-5 flex flex-wrap gap-2.5 items-center content-start shadow-inner">
            {selectedWords.length === 0 ? (
              <p className="text-slate-400 text-sm font-bold w-full text-center py-6 animate-pulse">
                👇 Chạm vào các khối từ bên dưới để sắp xếp vào đây nhé!
              </p>
            ) : (
              selectedWords.map((item) => (
                <WordBlock 
                  key={item.id} 
                  text={item.text} 
                  variant="emerald" 
                  onClick={() => handleRemoveWord(item)}
                  animation="fly-down"
                />
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-2"></div>

          {/* KHO TỪ ĐỂ CHỌN (Word Pool) */}
          <div className="flex flex-wrap gap-3 justify-center py-2">
            {poolWords.map((item) => (
              <WordBlock 
                key={item.id} 
                text={item.text} 
                variant="default" 
                onClick={() => handleSelectWord(item)} 
                animation="fly-up"
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
            disabled={selectedWords.length === 0}
            className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all text-base flex items-center justify-center gap-2 ${
              selectedWords.length > 0 
                ? 'bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 border-b-4 border-emerald-700 text-white cursor-pointer shadow-emerald-200' 
                : 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
            }`}
          >
            Kiểm tra đáp án
          </button>
        )}

        {status === 'correct' && (
          <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between animate-bounce-short border-2 border-emerald-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🎉
              </div>
              <div>
                <h4 className="font-black text-lg">Quá đỉnh, chính xác hoàn hảo!</h4>
                <p className="text-xs text-emerald-100 font-bold">+{25 + Math.max(0, streak - 1) * 5} XP · {streak > 1 ? `COMBO x${streak}` : 'Bắt đầu chuỗi thắng!'}</p>
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
          <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between border-2 border-rose-400 animate-shake">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🙈
              </div>
              <div>
                <h4 className="font-black text-lg">Ối, chưa đúng rồi!</h4>
                <p className="text-xs text-rose-100 font-medium">Đáp án chuẩn: "{currentQ.correctSentence.join(' ')}"</p>
              </div>
            </div>
            <button
              onClick={() => {
                playSelect();
                setStatus('playing');
                setPoolWords(createWordPool(currentQ));
                setSelectedWords([]);
              }}
              className="px-6 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Thử lại
            </button>
          </div>
        )}
      </div>

      {status === 'correct' && <GameReward xp={25 + Math.max(0, streak - 1) * 5} streak={streak} />}

      {/* --- MODALS --- */}
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