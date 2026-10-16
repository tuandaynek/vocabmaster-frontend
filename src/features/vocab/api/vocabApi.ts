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
  VocabSaveResponse,
  VocabReviewResponse,
  VocabDeleteResponse,
} from "../types";

// The shared Axios client unwraps response.data at runtime without reflecting that in its AxiosInstance type.
const asApiResponse = <T,>(request: Promise<unknown>): Promise<T> =>
  request as unknown as Promise<T>;

export const vocabApi = {
  extract: (data: VocabExtractPayload): Promise<VocabExtractResponse> => {
    return asApiResponse(
      axiosClient.post<VocabExtractResponse>(ENDPOINTS.VOCAB.EXTRACT, data),
    );
  },

  save: (data: VocabSavePayload): Promise<VocabSaveResponse> => {
    return asApiResponse(
      axiosClient.post<VocabSaveResponse>(ENDPOINTS.VOCAB.SAVE, data),
    );
  },

  getUserList: (): Promise<UserVocabularyListResponse> => {
    return asApiResponse(
      axiosClient.get<UserVocabularyListResponse>(ENDPOINTS.VOCAB.USER_LIST),
    );
  },

  deleteUserVocabulary: (id: string): Promise<VocabDeleteResponse> => {
    return asApiResponse(
      axiosClient.delete<VocabDeleteResponse>(ENDPOINTS.VOCAB.DELETE(id)),
    );
  },

  getGlobalDictionary: (
    params?: GlobalDictionaryQueryParams,
  ): Promise<GlobalDictionaryResponse> => {
    return asApiResponse(
      axiosClient.get<GlobalDictionaryResponse>(ENDPOINTS.VOCAB.GLOBAL_LIST, {
        params,
      }),
    );
  },

  getDueCards: (): Promise<UserVocabularyListResponse> => {
    return asApiResponse(
      axiosClient.get<UserVocabularyListResponse>(ENDPOINTS.VOCAB.DUE_CARDS),
    );
  },

  reviewCard: (
    data: ReviewRequestPayload,
  ): Promise<VocabReviewResponse> => {
    return asApiResponse(
      axiosClient.post<VocabReviewResponse>(ENDPOINTS.VOCAB.REVIEW, data),
    );
  },
};
