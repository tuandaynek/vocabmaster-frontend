import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { ChatMessage } from "../types/writing.types";

export interface TutorChatPayload {
  questionText: string;
  targetBand: string;
  chatHistory: ChatMessage[];
  userMessage: string;
}

interface TutorChatApiResponse {
  data: {
    reply: string;
  };
}

export const writingApi = {
  sendTutorMessage: async (payload: TutorChatPayload): Promise<string> => {
    const response = await axiosClient.post(
      ENDPOINTS.WRITING.TUTOR_CHAT,
      payload,
    ) as unknown as TutorChatApiResponse;

    return response.data.reply;
  },
};
