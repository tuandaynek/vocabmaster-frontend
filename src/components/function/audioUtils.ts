import { toast } from "sonner";
import { ENDPOINTS } from "@/api/endpoints";
import axiosClient from "@/api/axiosClient";

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
  const fallbackWebSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Trình duyệt không hỗ trợ phát âm thanh");
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
