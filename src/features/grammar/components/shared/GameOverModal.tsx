import { HeartCrack, RotateCcw, Home } from 'lucide-react';
import { useGameSound } from './useGameSound';

interface GameOverModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onExit: () => void;
}

export default function GameOverModal({ isOpen, onRetry, onExit }: GameOverModalProps) {
  const { playSelect } = useGameSound();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-pop-in">
      <div role="dialog" aria-modal="true" aria-labelledby="game-over-title" className="bg-white/95 backdrop-blur-md border-2 border-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-rose-950/20 space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl mx-auto flex items-center justify-center shadow-inner animate-bounce-short">
          <HeartCrack className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h3 id="game-over-title" className="text-2xl font-black text-slate-800">Hết Tim Mất Rồi! 💔</h3>
          <p className="text-sm text-slate-500 font-medium">
            Đừng nản chí nhé! Hãy hít một hơi thật sâu và thử lại để chinh phục thử thách ngữ pháp này nào.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onRetry}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-md border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> Thử lại ngay 🔄
          </button>
          <button
            onClick={() => {
              playSelect();
              onExit();
            }}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer border-b-4 border-slate-300 active:border-b-0 active:translate-y-1"
          >
            <Home className="w-4 h-4" /> Về trang chủ bản đồ
          </button>
        </div>
      </div>
    </div>
  );
}