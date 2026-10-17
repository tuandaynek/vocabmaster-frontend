import { useState } from 'react';
import { Bug } from 'lucide-react';
import { useGameSound } from '../../hooks/useGameSound';
import GameHeader from '../shared/GameHeader';
import GameOverModal from '../shared/GameOverModal';
import VictoryModal from '../shared/VictoryModal';
import GameReward from '../shared/GameReward';
import type { CampaignAnswer, GameStageResult } from '../../types/gameAnalytics';
import type { ErrorQuestion, ErrorWordOption } from '../../types/grammarData';
import EmptyGameState from '../shared/EmptyGameState';

interface ErrorSpotterGameProps {
  onBack?: () => void;
  onComplete?: (result: GameStageResult) => void;
  onAnswer?: (answer: CampaignAnswer) => void;
  questions?: ErrorQuestion[];
  stageTitle?: string;
  stageId?: string;
  subTopicTitle?: string;
  initialLives?: number;
}

export default function ErrorSpotterGame({ onBack, onComplete, onAnswer, questions = [], stageTitle, stageId = 'error', subTopicTitle = stageTitle ?? 'Ngữ pháp', initialLives = 5 }: ErrorSpotterGameProps) {
  const { playSelect, playCorrect, playIncorrect, playGameOver, playVictory } = useGameSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');

  // Modals state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentQ = questions[currentIndex];
  if (!currentQ) return <EmptyGameState onBack={onBack} />;
  const parts = currentQ.sentenceParts;

  const optionsList = [parts.optionA, parts.optionB, parts.optionC, parts.optionD];
  const errorOption = optionsList.find(o => o.isError);

  const handleSelectWord = (option: ErrorWordOption) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setSelectedKey(option.key);
    const sentencePrompt = [
      parts.prefix, parts.optionA.text, parts.mid1, parts.optionB.text,
      parts.mid2, parts.optionC.text, parts.mid3, parts.optionD.text, parts.suffix
    ].filter(Boolean).join('');
    onAnswer?.({
      stageId,
      subTopicTitle,
      questionId: currentQ.id,
      prompt: sentencePrompt,
      correctAnswer: errorOption?.text ?? '',
      submittedAnswer: option.text,
      isCorrect: option.isError
    });

    if (option.isError) {
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
      setSelectedKey(null);
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
    setSelectedKey(null);
    setStatus('playing');
    setIsGameOver(false);
    setIsVictory(false);
  };

  const renderWordButton = (option: ErrorWordOption) => {
    const isSelected = selectedKey === option.key;
    let btnClass = "max-w-full whitespace-normal break-words [overflow-wrap:anywhere] px-2.5 py-1.5 rounded-xl font-bold border-2 border-b-4 transition-all mx-1 cursor-pointer select-none ";

    if (status !== 'playing') {
      if (option.isError) {
        btnClass += "bg-emerald-500 text-white border-emerald-700 animate-pop-in";
      } else if (isSelected && !option.isError) {
        btnClass += "bg-rose-500 text-white border-rose-700 animate-shake";
      } else {
        btnClass += "bg-white border-slate-200 text-slate-400 opacity-60";
      }
    } else {
      btnClass += isSelected 
        ? "bg-rose-500 text-white border-rose-700" 
        : "bg-white border-slate-300 hover:border-rose-400 hover:bg-rose-50 text-slate-800 shadow-sm";
    }

    return (
      <button
        onClick={() => handleSelectWord(option)}
        disabled={status !== 'playing' || isGameOver}
        className={btnClass}
      >
        <span className="text-xs text-rose-500 font-black mr-1">({option.key})</span>
        {option.text}
      </button>
    );
  };

  return (
    <div className={`grammar-game min-h-dvh overflow-x-clip bg-gradient-to-br from-rose-50 via-amber-50/20 to-teal-50/30 text-slate-800 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:p-8 font-sans flex flex-col justify-between ${status === 'incorrect' ? 'animate-shake' : ''}`}>
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-6">

        {/* --- HEADER --- */}
        <GameHeader 
          onBack={onBack}
          lives={lives}
          xp={xp}
          streak={streak}
          title={stageTitle ?? 'Săn Lỗi Sai (Error Spotter)'}
          currentStep={currentIndex + 1}
          totalSteps={questions.length}
        />

        {/* --- GAME CARD CHÍNH --- */}
        <div className="game-card min-w-0 bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-rose-200/40 space-y-6">
          
          <div className="space-y-3 text-center">
            <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-sm">
              <Bug className="w-4 h-4 text-rose-500" /> Bấm vào cụm từ bị SAI trong câu dưới đây
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Tìm và sửa lỗi ngữ pháp tiếng Anh
            </h2>
          </div>

          {/* KHU VỰC CÂU VĂN TƯƠNG TÁC */}
          <div className="break-words [overflow-wrap:anywhere] p-3 sm:p-6 md:p-8 bg-slate-50/80 border-2 border-slate-200/80 rounded-3xl leading-loose text-base md:text-lg font-medium text-slate-800 tracking-wide text-center shadow-inner">
            {parts.prefix && <span>{parts.prefix} </span>}
            {renderWordButton(parts.optionA)}
            {parts.mid1 && <span>{parts.mid1}</span>}
            {renderWordButton(parts.optionB)}
            {parts.mid2 && <span>{parts.mid2}</span>}
            {renderWordButton(parts.optionC)}
            {parts.mid3 && <span>{parts.mid3}</span>}
            {renderWordButton(parts.optionD)}
            {parts.suffix && <span>{parts.suffix}</span>}
          </div>

        </div>

      </div>

      {/* --- FOOTER FEEDBACK MODAL --- */}
      <div className="max-w-3xl mx-auto w-full mt-6">
        {status === 'correct' && (
          <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce-short border-2 border-emerald-400">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                🎯
              </div>
              <div>
                <h4 className="font-black text-lg">Bắt đúng con sâu ngữ pháp rồi!</h4>
                <p className="text-xs text-emerald-100 font-bold">
                  +{25 + Math.max(0, streak - 1) * 5} điểm · {streak > 1 ? `COMBO x${streak}` : 'Bắt đầu chuỗi thắng!'}{' '}
                  Sửa đúng: <span className="underline">{errorOption?.correctForm}</span>. {currentQ.explanation}
                </p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-7 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black rounded-2xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              Câu tiếp theo
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
                <h4 className="font-black text-lg">Hơ, chỗ đó không sai đâu nha!</h4>
                <p className="text-xs text-rose-100 font-medium">Thử nhìn lại thật kỹ các cấu trúc từ nối hoặc chia thì xem nào.</p>
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