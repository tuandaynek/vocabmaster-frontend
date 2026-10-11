import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  ChatStepRequest,
  ChatStepResponse,
  CollocationsPayload,
  CollocationItem,
  EvaluatePayload,
  EvaluationResponse,
  IdeaHintsRequest,
  IdeaHintsResponse,
  SpeakingApiResponse,
  TtsResponse,
  SaveSpeakingHistoryPayload,
} from "../types/speaking.types";

type EvaluationApiPayload = Partial<EvaluationResponse> & {
  scores?: {
    fluencyAndCoherence?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
    pronunciation?: number | null;
    overall?: number;
  };
  ideaStrategyFeedback?: {
    examinerMindset?: string;
    analysis?: string;
    actionableTip?: string;
  };
  collocationUpgrades?: EvaluationResponse["lexicalUpgrades"];
  upgradedModelAnswer?: string;
  coherenceFeedback?: EvaluationResponse["coherenceFeedback"];
};

function normalizeEvaluation(payload: EvaluationApiPayload): EvaluationResponse {
  const scores = payload.bandScores ?? {
    fluencyCoherence: payload.scores?.fluencyAndCoherence ?? 0,
    lexicalResource: payload.scores?.lexicalResource ?? 0,
    grammarAccuracy: payload.scores?.grammaticalRange ?? 0,
    pronunciation: payload.scores?.pronunciation ?? null,
    overall: payload.scores?.overall ?? 0,
  };

  return {
    bandScores: scores,
    strategyFeedback: payload.strategyFeedback ?? {
      examinerPerspective: payload.ideaStrategyFeedback?.examinerMindset ?? "",
      actionableAdvice: payload.ideaStrategyFeedback?.actionableTip ?? payload.ideaStrategyFeedback?.analysis ?? "",
    },
    grammarCorrections: payload.grammarCorrections ?? [],
    lexicalUpgrades: payload.lexicalUpgrades ?? payload.collocationUpgrades ?? [],
    pronunciationFeedback: payload.pronunciationFeedback ?? [],
    fluencyFeedback: payload.fluencyFeedback ?? {
      pacingAndPauses: "",
      chunkingTip: "",
    },
    sampleAnswer: payload.sampleAnswer ?? payload.upgradedModelAnswer ?? "",
    coherenceFeedback: payload.coherenceFeedback,
    transcript: payload.transcript,
    wordTimestamps: payload.wordTimestamps,
    pauseAnalysis: payload.pauseAnalysis,
    userAudioUrl: payload.userAudioUrl,
  };
}

export const speakingApi = {
  chatStep: async (payload: ChatStepRequest): Promise<ChatStepResponse> => {
    const response = await axiosClient.post<SpeakingApiResponse<ChatStepResponse>>(ENDPOINTS.SPEAKING.CHAT_STEP, payload) as unknown as SpeakingApiResponse<ChatStepResponse>;
    return response.data;
  },

  getCollocations: async (payload: CollocationsPayload): Promise<CollocationItem[]> => {
    const response = await axiosClient.post<SpeakingApiResponse<CollocationItem[]>>(ENDPOINTS.SPEAKING.COLLOCATIONS, payload) as unknown as SpeakingApiResponse<CollocationItem[]>;
    return response.data;
  },

  getIdeaHints: async (payload: IdeaHintsRequest): Promise<IdeaHintsResponse> => {
    const response = await axiosClient.post<SpeakingApiResponse<IdeaHintsResponse>>(ENDPOINTS.SPEAKING.HINTS, payload);
    return response.data.data;
  },

  evaluate: async (payload: EvaluatePayload): Promise<EvaluationResponse> => {
    const formData = new FormData();
    formData.append("question", payload.question);
    formData.append("targetBand", payload.targetBand);
    // Backend cần dạng chuỗi để parse lại
    formData.append("fullTranscript", payload.fullTranscript); 

    // Nếu có audio, append file vào form data
    if (payload.audioBlob) {
      formData.append("audio", payload.audioBlob, "speaking_session.webm");
      formData.append("mimeType", payload.audioBlob.type);
    }

    const response = await axiosClient.post<SpeakingApiResponse<EvaluationApiPayload>>(
      ENDPOINTS.SPEAKING.EVALUATE, // Chỉ dùng chung 1 endpoint
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ) as unknown as SpeakingApiResponse<EvaluationApiPayload>;
    
    return normalizeEvaluation(response.data);
  },

  getPronunciationSample: async (text: string): Promise<Blob> => {
    const response = await axiosClient.post<SpeakingApiResponse<TtsResponse>>(
      ENDPOINTS.SPEAKING.TTS_SAMPLE,
      { text },
    ) as unknown as SpeakingApiResponse<TtsResponse>;
    const binary = atob(response.data.audioBase64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new Blob([bytes], { type: "audio/mpeg" });
  },

  saveVocabularyUpgrade: async (payload: {
    originalWord: string;
    upgradedWord: string;
    meaning: string;
    example?: string;
    topic?: string;
  }): Promise<void> => {
    await axiosClient.post(ENDPOINTS.VOCAB.SAVE, payload);
  },

  saveSpeakingHistory: async (payload: SaveSpeakingHistoryPayload): Promise<void> => {
    await axiosClient.post(ENDPOINTS.SPEAKING.HISTORY, payload);
  },
};
