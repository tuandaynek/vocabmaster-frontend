import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  GlobalDictionaryQueryParams,
  GlobalDictionaryResponse,
  ReviewRequestPayload,
  UserVocabularyListResponse,
  VocabExtractPayload,
  VocabExtractResponse,
  VocabSavePayload,
  UserVocabularyItem,
} from "../types";

export const vocabApi = {
  extract: (data: VocabExtractPayload): Promise<VocabExtractResponse> => {
    return axiosClient.post<VocabExtractResponse>(
      ENDPOINTS.VOCAB.EXTRACT,
      data,
    ) as unknown as Promise<VocabExtractResponse>;
  },

  save: (
    data: VocabSavePayload,
  ): Promise<{ success: boolean; savedCount: number; message: string }> => {
    return axiosClient.post(ENDPOINTS.VOCAB.SAVE, data) as unknown as Promise<{ success: boolean; savedCount: number; message: string }>;
  },

  getUserList: (): Promise<UserVocabularyListResponse> => {
    return axiosClient.get(ENDPOINTS.VOCAB.USER_LIST) as unknown as Promise<UserVocabularyListResponse>;
  },

  deleteUserVocabulary: (
    id: string,
  ): Promise<{ success: boolean; message?: string }> => {
    return axiosClient.delete(ENDPOINTS.VOCAB.DELETE(id)) as unknown as Promise<{ success: boolean; message?: string }>;
  },

  getGlobalDictionary: (params?: GlobalDictionaryQueryParams): Promise<GlobalDictionaryResponse> => {
    return axiosClient.get(ENDPOINTS.VOCAB.GLOBAL_LIST, { params }) as unknown as Promise<GlobalDictionaryResponse>;
  },

  getDueCards: (): Promise<UserVocabularyListResponse> => {
    return axiosClient.get(ENDPOINTS.VOCAB.DUE_CARDS) as unknown as Promise<UserVocabularyListResponse>;
  },

  reviewCard: (
    data: ReviewRequestPayload,
  ): Promise<{ success: boolean; data?: any; message?: string }> => {
    return axiosClient.post(ENDPOINTS.VOCAB.REVIEW, data) as unknown as Promise<{ success: boolean; data?: UserVocabularyItem; message?: string }>;
  },

};
