import { useState } from 'react';
import { MessageSquareQuote, UserCheck, RefreshCw } from 'lucide-react';
import { useGameSound } from '../shared/useGameSound';
import GameHeader from '../shared/GameHeader';
import GameOverModal from '../shared/GameOverModal';
import VictoryModal from '../shared/VictoryModal';
import GameReward from '../shared/GameReward';

interface ScenarioOption {
  id: string;
  text: string;
  isCorrect: boolean;
  nuanceExplanation: string;
}

interface ContextQuestion {
  id: string;
  speakerA: string;
  speakerBContext: string;
  options: ScenarioOption[];
  explanation: string;
}

const FAKE_CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'ctx-1',
    speakerA: 'Look at the heavy dark clouds outside! It’s getting so dark.',
    speakerBContext: 'Oh dear! It _____ rain very soon. We should hurry home!',
    options: [
      { 
        id: 'opt-1', 
        text: 'is going to', 
        isCorrect: true, 
        nuanceExplanation: 'Chính xác! Dùng "be going to" khi có dấu hiệu trực quan rõ ràng ở hiện tại (mây đen u uất).' 
      },
      { 
        id: 'opt-2', 
        text: 'will', 
        isCorrect: false, 
        nuanceExplanation: '"will" thường chỉ dự đoán bột phát hoặc không có căn cứ trực quan ở hiện tại.' 
      },
      { 
        id: 'opt-3', 
        text: 'shall', 
        isCorrect: false, 
        nuanceExplanation: '"shall" không dùng để dự đoán thời tiết trong tình huống này.' 
      }
    ],
    explanation: 'Dự đoán thời tiết dựa trên bằng chứng trực quan ở hiện tại (mây đen) bắt buộc dùng "be going to + V".'
  },
  {
    id: 'ctx-2',
    speakerA: 'I failed my driving test yesterday because I was too nervous.',
    speakerBContext: 'If I were you, I _____ more before taking it again.',
    options: [
      { 
        id: 'opt-1', 
        text: 'would practice', 
        isCorrect: true, 
        nuanceExplanation: 'Chính xác! Cấu trúc "If I were you, I would..." dùng để đưa ra lời khuyên chân thành.' 
      },
      { 
        id: 'opt-2', 
        text: 'will practice', 
        isCorrect: false, 
        nuanceExplanation: 'Câu điều kiện loại 2 giả định trái với hiện tại nên dùng "would + V".' 
      },
      { 
        id: 'opt-3', 
        text: 'practiced', 
        isCorrect: false, 
        nuanceExplanation: 'Thiếu động từ khuyết thiếu "would" trong mệnh đề chính.' 
      }
    ],
    explanation: 'Đưa ra lời khuyên trong giao tiếp dùng câu điều kiện loại 2: "If I were you, I would + V".'
  },
  {
    id: 'ctx-3',
    speakerA: 'Why didn’t Alex attend the team meeting this morning?',
    speakerBContext: 'He _____ about the schedule change. Nobody notified him.',
    options: [
      { 
        id: 'opt-1', 
        text: 'must not have known', 
        isCorrect: true, 
        nuanceExplanation: 'Chính xác! Suy đoán chắc chắn về một sự việc trong quá khứ dựa trên bằng chứng ("Nobody notified him").' 
      },
      { 
        id: 'opt-2', 
        text: 'shouldn’t have known', 
        isCorrect: false, 
        nuanceExplanation: '"shouldn’t have V3" nghĩa là lẽ ra không nên làm gì trong quá khứ.' 
      },
      { 
        id: 'opt-3', 
        text: 'needn’t know', 
        isCorrect: false, 
        nuanceExplanation: 'Sai thì và sai ý nghĩa dự đoán quá khứ.' 
      }
    ],
    explanation: 'Suy đoán quá khứ có căn cứ rõ ràng: "must + have + V3/ed" (chắc hẳn là đã...).'
  }
];

export default function ContextMatchGame({ onBack, onComplete }: { onBack?: () => void; onComplete?: () => void }) {
  const { playSelect, playCorrect, playIncorrect, playGameOver, playVictory } = useGameSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');

  // Modals state
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  const currentQ = FAKE_CONTEXT_QUESTIONS[currentIndex];
  const selectedOpt = currentQ.options.find(o => o.id === selectedOptionId);

  const handleSelectOption = (option: ScenarioOption) => {
    if (status !== 'playing' || isGameOver) return;
    playSelect();
    setSelectedOptionId(option.id);

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
    if (currentIndex < FAKE_CONTEXT_QUESTIONS.length - 1) {
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
    setLives(5);
    setXp(0);
    setStreak(0);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setStatus('playing');
    setIsGameOver(false);
    setIsVictory(false);
  };

  return (
    <div className={`grammar-game min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50/20 to-sky-50/30 text-slate-800 p-4 md:p-8 font-sans flex flex-col justify-between ${status === 'incorrect' ? 'animate-shake' : ''}`}>
      <div className="max-w-3xl mx-auto w-full space-y-6">

        {/* --- HEADER --- */}
        <GameHeader 
          onBack={onBack}
          lives={lives}
          xp={xp}
          streak={streak}
          title="Ghép Tình Huống (Context Match)"
          currentStep={currentIndex + 1}
          totalSteps={FAKE_CONTEXT_QUESTIONS.length}
        />

        {/* --- GAME CARD CHÍNH --- */}
        <div className="game-card bg-white/90 backdrop-blur-md border-2 border-white rounded-3xl p-6 md:p-8 shadow-xl shadow-teal-200/40 space-y-6">
          
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
              <div className="bg-white p-4 rounded-3xl rounded-tl-none border-2 border-slate-200 text-slate-800 font-bold text-sm md:text-base shadow-sm">
                "{currentQ.speakerA}"
              </div>
            </div>

            {/* Speaker B */}
            <div className="flex gap-3 items-start flex-row-reverse animate-pop-in">
              <div className="w-10 h-10 bg-teal-500 text-white font-black rounded-2xl flex items-center justify-center shrink-0 shadow-md text-base border-b-2 border-teal-700">
                B
              </div>
              <div className="bg-teal-500 text-white p-4 rounded-3xl rounded-tr-none border-b-4 border-teal-700 font-bold text-sm md:text-base shadow-md">
                "{currentQ.speakerBContext.replace('_____', selectedOpt ? `[ ${selectedOpt.text} ]` : '_____')}"
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
                  <span className="flex items-center gap-3">
                    <UserCheck className={`w-5 h-5 ${isSelected || option.isCorrect ? 'text-white' : 'text-teal-500'}`} />
                    {option.text}
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
                <p className="text-xs text-emerald-100 font-bold">+{25 + Math.max(0, streak - 1) * 5} XP · {streak > 1 ? `COMBO x${streak}` : 'Bắt đầu chuỗi thắng!'} · {selectedOpt?.nuanceExplanation}</p>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full md:w-auto px-7 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black rounded-2xl shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              Tiếp tục 🚀
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
              onClick={() => {
                playSelect();
                setStatus('playing');
                setSelectedOptionId(null);
              }}
              className="w-full md:w-auto px-7 py-3.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Thử lại 🔄
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
        onNext={onComplete || onBack || (() => {})} 
        onReplay={handleRetryGame}
      />
    </div>
  );
}