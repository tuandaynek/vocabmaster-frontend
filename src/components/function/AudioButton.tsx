// components/function/AudioButton.tsx
import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { playWordAudio } from "./audioUtils";

interface AudioButtonProps {
  text: string;
  audioUrl?: string | null;
  className?: string;
}

export function AudioButton({ text, audioUrl, className = "" }: AudioButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await playWordAudio(text, audioUrl);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={loading}
      className={className || "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"}
      title="Nghe phát âm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}