import { Flame, Sparkles } from 'lucide-react';

interface GameRewardProps {
  xp: number;
  streak: number;
}

export default function GameReward({ xp, streak }: GameRewardProps) {
  return (
    <div
      key={`${xp}-${streak}`}
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-24 z-30 animate-reward-float"
    >
      <div className="flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-white/90 px-4 py-2.5 font-black text-amber-600 shadow-xl shadow-amber-200/60 backdrop-blur-md">
        <Sparkles className="h-4 w-4" />
        <span>+{xp} XP</span>
        {streak > 1 && (
          <span className="flex items-center gap-1 rounded-xl bg-orange-100 px-2 py-1 text-orange-600">
            <Flame className="h-3.5 w-3.5 fill-orange-500" />
            COMBO x{streak}
          </span>
        )}
      </div>
    </div>
  );
}
