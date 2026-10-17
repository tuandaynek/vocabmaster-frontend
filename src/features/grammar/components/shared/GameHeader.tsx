import { ArrowLeft, Heart, Zap, Flame, Timer } from 'lucide-react';
import { useGameSound } from '../../hooks/useGameSound';

interface GameHeaderProps {
  onBack?: () => void;
  lives: number;
  xp: number;
  streak?: number;
  timeLeft?: number;
  title?: string;
  currentStep?: number;
  totalSteps?: number;
}

export default function GameHeader({
  onBack,
  lives,
  xp,
  streak,
  timeLeft,
  title,
  currentStep,
  totalSteps
}: GameHeaderProps) {
  const { playSelect } = useGameSound();

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border-2 border-white shadow-lg shadow-slate-200/60">
        <button 
          onClick={() => {
            if (!onBack) return;
            playSelect();
            onBack();
          }}
          disabled={!onBack}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all active:scale-95 flex items-center gap-1 text-xs font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát
        </button>

        {/* Progress bar hoặc Title giữa */}
        <div className="flex-1 min-w-28 mx-1 md:mx-4 text-center">
          {title && <span className="text-xs font-black text-slate-400 block mb-0.5">{title}</span>}
          {currentStep !== undefined && totalSteps !== undefined && (
            <div className="flex items-center justify-center gap-2">
              <div
                role="progressbar"
                aria-label="Tiến độ câu hỏi"
                aria-valuemin={0}
                aria-valuemax={totalSteps}
                aria-valuenow={currentStep}
                className="w-28 md:w-40 h-2.5 bg-slate-100 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-extrabold text-slate-500">{currentStep}/{totalSteps}</span>
            </div>
          )}
        </div>

        {/* Stats: Streak, Timer, Lives, session score */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 md:gap-2">
          {streak !== undefined && streak > 0 && (
            <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl font-extrabold flex items-center gap-1 text-xs animate-bounce-short">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" /> x{streak}
            </div>
          )}
          {timeLeft !== undefined && (
            <div className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1 text-xs border ${
              timeLeft <= 5 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-sky-50 border-sky-200 text-sky-600'
            }`}>
              <Timer className="w-4 h-4" /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
            </div>
          )}
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-extrabold flex items-center gap-1 text-xs shadow-sm">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" /> {lives}
          </div>
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl font-extrabold flex items-center gap-1 text-xs shadow-sm">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" /> {xp}
          </div>
        </div>
      </div>
    </div>
  );
}