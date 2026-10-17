import { useState, useEffect } from 'react';
import { useGameSound } from '../../hooks/useGameSound';
import GameHeader from '../shared/GameHeader';
import GameOverModal from '../shared/GameOverModal';
import VictoryModal from '../shared/VictoryModal';
import GameReward from '../shared/GameReward';
import type { CampaignAnswer, GameStageResult } from '../../types/gameAnalytics';
import type { QuizQuestion } from '../../types/grammarData';
import EmptyGameState from '../shared/EmptyGameState';

interface SpeedGrammarQuizProps {
  onBack?: () => void;
  onComplete?: (result: GameStageResult) => void;
  onAnswer?: (answer: CampaignAnswer) => void;
  questions?: QuizQuestion[];
  stageTitle?: string;
  stageId?: string;
  subTopicTitle?: string;
  initialLives?: number;
}

export default function SpeedGrammarQuiz({ onBack, onComplete, onAnswer, questions = [], stageTitle, stageId = 'speed', subTopicTitle = stageTitle ?? 'Ngữ pháp', initialLives = 5 }: SpeedGrammarQuizProps) {
  const { playSelect, playTick, playCorrect, playIncorrect, playGameOver, playVictory } = useGameSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const QUESTION_TIME = 15;
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect' | 'timeout'>('playing');

  // Modals state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!currentQ || status !== 'playing' || isGameOver) return;

    const timer = setTimeout(() => {
      if (timeLeft <= 5) playTick(timeLeft <= 3);

      if (timeLeft <= 1) {
        playIncorrect();
        setStatus('timeout');
        onAnswer?.({
          stageId,
          subTopicTitle,
          questionId: currentQ.id,
          prompt: currentQ.question,
          correctAnswer: currentQ.correctAnswer,
          submittedAnswer: 'Hết giờ',
          isCorrect: false
        });
        const nextLives = Math.max(0, lives - 1);
        setLives(nextLives);
        setStreak(0);

        if (nextLives === 0) {
          playGameOver();
          setIsGameOver(true);
        }
        return;
      }

      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, status, lives, isGameOver, currentQ, onAnswer, stageId, subTopicTitle, playIncorrect, playGameOver, playTick]);

  if (!currentQ) return <EmptyGameState onBack={onBack} />;

  const handleSelectOption = (option: string) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setSelectedAnswer(option);
    const isCorrect = option === currentQ.correctAnswer;
    onAnswer?.({
      stageId,
      subTopicTitle,
      questionId: currentQ.id,
      prompt: currentQ.question,
      correctAnswer: currentQ.correctAnswer,
      submittedAnswer: option,
      isCorrect
    });

    if (isCorrect) {
      playCorrect();
      setStatus('correct');
      const bonusXp = 15 + streak * 5;
      setXp(prev => prev + bonusXp);
      setStreak(prev => prev + 1);
    } else {
      playIncorrect();
      setStatus('incorrect');
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
      setStreak(0);

      if (nextLives === 0) {
        playGameOver();
        setIsGameOver(true);
      }
    }
  };

  const handleNext = () => {
    playSelect();
    if (currentIndex < questions.length - 1) {
      setTimeLeft(QUESTION_TIME);
      setSelectedAnswer(null);
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
    setTimeLeft(QUESTION_TIME);
    setIsGameOver(false);
    setIsVictory(false);
    setSelectedAnswer(null);
    setStatus('playing');
  };

  return (
    <div className={`grammar-game min-h-dvh overflow-x-clip bg-gradient-to-br from-sky-50 via-indigo-50/20 to-blue-50/30 text-slate-800 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:p-8 font-sans flex flex-col justify-between ${status === 'incorrect' || status === 'timeout' ? 'animate-shake' : ''}`}>
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6">

        {/* --- HEADER DÙNG CHUNG --- */}
        <GameHeader 
          onBack={onBack}
          lives={lives}
          xp={xp}
          streak={streak}
          timeLeft={timeLeft}
          title={stageTitle ?? 'Đua Tốc Độ (Speed Quiz)'}
          currentStep={currentIndex + 1}
          totalSteps={questions.length}
        />

        {/* --- TIMER PROGRESS BAR --- */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${
              timeLeft > 5 ? 'bg-sky-500' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
          ></div>
        </div>

        {/* --- GAME CARD CHÍNH --- */}
        <div className="game-card min-w-0 bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-sky-200/40 space-y-6">
          
          <div className="space-y-3 text-center">
            <span className="px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm">
              Chọn đáp án đúng trước khi hết giờ!
            </span>
            <h2 className="break-words text-xl md:text-2xl font-black text-slate-800 leading-snug tracking-tight">
              {currentQ.question}
            </h2>
          </div>

          {/* OPTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQ.correctAnswer;
              
              let btnStyle = "bg-white hover:bg-sky-50/60 border-2 border-b-4 border-slate-200 text-slate-700 hover:border-sky-300 shadow-sm";
              
              if (status !== 'playing') {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 border-b-4 border-emerald-700 text-white shadow-md animate-pop-in";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-500 border-b-4 border-rose-700 text-white shadow-md animate-shake";
                } else {
                  btnStyle = "bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  disabled={status !== 'playing' || isGameOver}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 font-bold rounded-2xl transition-all text-left flex items-center justify-between text-base active:translate-y-1 cursor-pointer ${btnStyle}`}
                >
                  <span className="flex min-w-0 items-center gap-3 break-words">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                      status !== 'playing' && isCorrect ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* --- FOOTER FEEDBACK MODAL --- */}
      <div className="max-w-3xl mx-auto w-full mt-6">
        {status === 'correct' && (
          <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce-short border-2 border-emerald-400">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                🔥
              </div>
              <div>
                <h4 className="font-black text-lg">Quá nhanh quá nguy hiểm!</h4>
                <p className="text-xs text-emerald-100 font-medium">+{15 + Math.max(0, streak - 1) * 5} điểm · {streak > 1 ? `COMBO x${streak}` : 'Bắt đầu chuỗi thắng!'} · {currentQ.explanation}</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-7 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black rounded-2xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              Tiếp tục
            </button>
          </div>
        )}

        {(status === 'incorrect' || status === 'timeout') && (
          <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-rose-400">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                {status === 'timeout' ? '⏰' : '🙈'}
              </div>
              <div>
                <h4 className="font-black text-lg">
                  {status === 'timeout' ? 'Hết giờ mất rồi!' : 'Chưa chính xác!'}
                </h4>
                <p className="text-xs text-rose-100 font-medium">
                  Đáp án đúng: <span className="font-bold underline">{currentQ.correctAnswer}</span>. {currentQ.explanation}
                </p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-7 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              Câu tiếp theo 👉
            </button>
          </div>
        )}
      </div>

      {status === 'correct' && <GameReward xp={15 + Math.max(0, streak - 1) * 5} streak={streak} />}

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