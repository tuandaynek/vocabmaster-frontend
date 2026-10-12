import { Trophy, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  xpEarned: number;
  onNext: () => void;
  onReplay?: () => void;
}

export default function VictoryModal({ isOpen, xpEarned, onNext, onReplay }: VictoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-pop-in">
      <div role="dialog" aria-modal="true" aria-labelledby="victory-title" className="bg-white/95 backdrop-blur-md border-2 border-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-amber-950/20 space-y-6">
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-inner animate-bounce-short">
          <Trophy className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-black inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Hoàn thành xuất sắc
          </span>
          <h3 id="victory-title" className="text-2xl font-black text-slate-800">Quá Đỉnh, Phá Đảo Chặng! 🎉</h3>
          <p className="text-sm text-slate-600 font-bold">
            Bạn nhận được <span className="text-amber-500 font-black text-lg">+{xpEarned} XP</span> vào tài khoản!
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onNext}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-md border-b-4 border-emerald-700 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            Tiếp tục hành trình <ArrowRight className="w-5 h-5" />
          </button>
          {onReplay && (
            <button
              onClick={onReplay}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer border-b-4 border-slate-300 active:border-b-0 active:translate-y-1"
            >
              <RotateCcw className="w-4 h-4" /> Ôn tập lại chặng này
            </button>
          )}
        </div>
      </div>
    </div>
  );
}