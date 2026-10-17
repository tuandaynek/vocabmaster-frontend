import { toast } from "sonner";
import { ENDPOINTS } from "@/api/endpoints";
import axiosClient from "@/api/axiosClient";

export function requiresMobileAudioGesture(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function readAudioUrl(response: unknown): string | null {
  if (
    typeof response === "object" &&
    response !== null &&
    "audioUrl" in response &&
    typeof response.audioUrl === "string"
  ) {
    return response.audioUrl;
  }
  return null;
}

export const playWordAudio = async (text: string, audioUrl?: string | null) => {
  const fallbackWebSpeech = (): boolean => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      return true;
    } else {
      toast.error("Trình duyệt không hỗ trợ phát âm thanh");
      return false;
    }
  };

  const playAudio = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(() => {
      fallbackWebSpeech();
    });
  };

  if (audioUrl) {
    playAudio(audioUrl);
    return;
  }

  if (requiresMobileAudioGesture() && fallbackWebSpeech()) {
    return;
  }

  try {
    const response = await axiosClient.get<unknown>(
      ENDPOINTS.VOCAB.AUDIO(text),
    );
    const generatedAudioUrl = readAudioUrl(response);
    if (generatedAudioUrl) {
      playAudio(generatedAudioUrl);
    } else {
      fallbackWebSpeech();
    }
  } catch {
    fallbackWebSpeech();
  }
};
