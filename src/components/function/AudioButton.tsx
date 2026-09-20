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
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 ${className}`}
      title="Nghe phát âm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}