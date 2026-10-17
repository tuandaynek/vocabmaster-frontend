import { useState } from 'react';
import { MessageSquareQuote, UserCheck } from 'lucide-react';
import { useGameSound } from '../../hooks/useGameSound';
import GameHeader from '../shared/GameHeader';
import GameOverModal from '../shared/GameOverModal';
import VictoryModal from '../shared/VictoryModal';
import GameReward from '../shared/GameReward';
import type { CampaignAnswer, GameStageResult } from '../../types/gameAnalytics';
import type { ContextQuestion, ScenarioOption } from '../../types/grammarData';
import EmptyGameState from '../shared/EmptyGameState';

interface ContextMatchGameProps {
  onBack?: () => void;
  onComplete?: (result: GameStageResult) => void;
  onAnswer?: (answer: CampaignAnswer) => void;
  questions?: ContextQuestion[];
  stageTitle?: string;
  stageId?: string;
  subTopicTitle?: string;
  initialLives?: number;
}

export default function ContextMatchGame({ onBack, onComplete, onAnswer, questions = [], stageTitle, stageId = 'context', subTopicTitle = stageTitle ?? 'Ngữ pháp', initialLives = 5 }: ContextMatchGameProps) {
  const { playSelect, playCorrect, playIncorrect, playGameOver, playVictory } = useGameSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');

  // Modals state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentQ = questions[currentIndex];
  if (!currentQ) return <EmptyGameState onBack={onBack} />;
  const selectedOpt = currentQ.options.find(o => o.id === selectedOptionId);

  const handleSelectOption = (option: ScenarioOption) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setSelectedOptionId(option.id);
    onAnswer?.({
      stageId,
      subTopicTitle,
      questionId: currentQ.id,
      prompt: `${currentQ.speakerA} · ${currentQ.speakerBContext}`,
      correctAnswer: currentQ.options.find(candidate => candidate.isCorrect)?.text ?? '',
      submittedAnswer: option.text,
      isCorrect: option.isCorrect
    });

    if (option.isCorrect) {
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
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setStatus('playing');
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
    setSelectedOptionId(null);
    setStatus('playing');
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <div className={`grammar-game min-h-dvh overflow-x-clip bg-gradient-to-br from-teal-50 via-emerald-50/20 to-sky-50/30 text-slate-800 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:p-8 font-sans flex flex-col justify-between ${status === 'incorrect' ? 'animate-shake' : ''}`}>
      <div className="max-w-3xl min-w-0 mx-auto w-full space-y-6">

        {/* --- HEADER --- */}
        <GameHeader 
          onBack={onBack}
          lives={lives}
          xp={xp}
          streak={streak}
          title={stageTitle ?? 'Ghép Tình Huống (Context Match)'}
          currentStep={currentIndex + 1}
          totalSteps={questions.length}
        />

        {/* --- GAME CARD CHÍNH --- */}
        <div className="game-card min-w-0 bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-teal-200/40 space-y-6">
          
          <div className="space-y-3 text-center">
            <span className="px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm">
              <MessageSquareQuote className="w-4 h-4 text-teal-600" /> Ngữ cảnh giao tiếp thực tế
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Chọn cấu trúc phù hợp nhất với ngữ cảnh bên dưới
            </h2>
          </div>

          {/* KHUNG HỘI THOẠI CHÁT DỄ THƯƠNG */}
          <div className="space-y-4 bg-slate-50/80 p-6 rounded-3xl border-2 border-slate-100 shadow-inner">
            {/* Speaker A */}
            <div className="flex gap-3 items-start animate-pop-in">
              <div className="w-10 h-10 bg-amber-400 text-amber-950 font-black rounded-2xl flex items-center justify-center shrink-0 shadow-md text-base border-b-2 border-amber-600">
                A
              </div>
              <div className="min-w-0 break-words [overflow-wrap:anywhere] bg-white p-4 rounded-3xl rounded-tl-none border-2 border-slate-200 text-slate-800 font-bold text-sm md:text-base shadow-sm">
                "{currentQ.speakerA}"
              </div>
            </div>

            {/* Speaker B */}
            <div className="flex gap-3 items-start flex-row-reverse animate-pop-in">
              <div className="w-10 h-10 bg-teal-500 text-white font-black rounded-2xl flex items-center justify-center shrink-0 shadow-md text-base border-b-2 border-teal-700">
                B
              </div>
              <div className="min-w-0 break-words [overflow-wrap:anywhere] bg-teal-500 text-white p-4 rounded-3xl rounded-tr-none border-b-4 border-teal-700 font-bold text-sm md:text-base shadow-md">
                "{currentQ.speakerBContext.replace('_____', selectedOpt ? ` ${selectedOpt.text} ` : '_____')}"
              </div>
            </div>
          </div>

          {/* DANH SÁCH LỰA CHỌN CẤU TRÚC */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              let style = "bg-white hover:bg-teal-50/60 border-2 border-b-4 border-slate-200 text-slate-700 hover:border-teal-300 shadow-sm";

              if (status !== 'playing') {
                if (option.isCorrect) {
                  style = "bg-emerald-500 border-b-4 border-emerald-700 text-white shadow-md animate-pop-in";
                } else if (isSelected && !option.isCorrect) {
                  style = "bg-rose-500 border-b-4 border-rose-700 text-white shadow-md animate-shake";
                } else {
                  style = "bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={status !== 'playing' || isGameOver}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 font-bold rounded-2xl transition-all text-left flex items-center justify-between text-sm md:text-base active:translate-y-1 cursor-pointer ${style}`}
                >
                  <span className="flex min-w-0 items-center gap-3 break-words">
                    <UserCheck className={`w-5 h-5 ${isSelected && option.isCorrect ? 'text-black' : 'text-teal-500'}`} />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{option.text}</span>
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
                🎭
              </div>
              <div>
                <h4 className="font-black text-lg">Ghép tình huống chuẩn bài!</h4>
                <p className="text-xs text-emerald-100 font-bold">+{25 + Math.max(0, streak - 1) * 5} điểm · {streak > 1 ? `COMBO x${streak}` : 'Bắt đầu chuỗi thắng!'} · {selectedOpt?.nuanceExplanation}</p>
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

        {status === 'incorrect' && (
          <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-rose-400">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                🙈
              </div>
              <div>
                <h4 className="font-black text-lg">Chưa tự nhiên lắm!</h4>
                <p className="text-xs text-rose-100 font-medium">{selectedOpt?.nuanceExplanation || currentQ.explanation}</p>
              </div>
            </div>
            <button
            onClick={handleNext}
            className="w-full md:w-auto px-7 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
            Câu tiếp theo
            </button>
          </div>
        )}
      </div>

      {status === 'correct' && <GameReward xp={25 + Math.max(0, streak - 1) * 5} streak={streak} />}

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