interface WordBlockProps {
  text: string;
  onClick: () => void;
  variant?: 'default' | 'emerald' | 'indigo' | 'rose' | 'amber';
  disabled?: boolean;
  animation?: 'fly-up' | 'fly-down' | 'pop-in';
}

export default function WordBlock({
  text,
  onClick,
  variant = 'default',
  disabled = false,
  animation = 'pop-in'
}: WordBlockProps) {
  const variantStyles = {
    default: 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-300',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white shadow-sm',
    indigo: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-700 text-white shadow-sm',
    rose: 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white shadow-sm',
    amber: 'bg-amber-500 hover:bg-amber-600 border-amber-700 text-white shadow-sm',
  };

  const animationStyles = {
    'fly-up': 'animate-fly-up',
    'fly-down': 'animate-fly-down',
    'pop-in': 'animate-pop-in',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 font-bold rounded-2xl border-2 border-b-4 transition-all duration-150 text-sm cursor-pointer select-none active:translate-y-1 active:border-b-0 hover:-translate-y-0.5 ${
        variantStyles[variant]
      } ${animationStyles[animation]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {text}
    </button>
  );
}