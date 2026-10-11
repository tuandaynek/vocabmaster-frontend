// components/function/AudioButton.tsx
import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ENDPOINTS } from "@/api/endpoints";
import axiosClient from "@/api/axiosClient";

// Helper function dùng chung cho cả AudioButton và Autoplay khi load card
export const playWordAudio = async (text: string, audioUrl?: string | null) => {
  const playAudio = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch((err) => {
      console.error("Audio play error:", err);
      fallbackWebSpeech();
    });
  };

  const fallbackWebSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Dừng âm thanh đang phát dở
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Trình duyệt không hỗ trợ phát âm thanh");
    }
  };

  // 1. Ưu tiên xài audio_url sẵn có
  if (audioUrl) {
    playAudio(audioUrl);
    return;
  }

  // 2. Gọi Backend ElevenLabs API nếu chưa có
  try {
    const res = await axiosClient.get(ENDPOINTS.VOCAB.AUDIO(text));
    if (res?.audioUrl) {
      playAudio(res.audioUrl);
    } else {
      fallbackWebSpeech();
    }
  } catch (error) {
    console.warn("ElevenLabs TTS failed, falling back to Web Speech:", error);
    fallbackWebSpeech();
  }
};

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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${className}`}
      title="Nghe phát âm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}