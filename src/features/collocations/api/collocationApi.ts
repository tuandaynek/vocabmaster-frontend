import type { AxiosResponse } from "axios";
import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  CollocationReviewData,
  CollocationImportItem,
  GlobalCollocationsQueryParams,
  GlobalCollocationsResponse,
  NextCollocationItem,
  ReviewRequestPayload,
  UserCollocationListResponse,
  EvaluatePhase2Payload,
  EvaluatePhase2Response,
  EvaluatePhase3Payload,
  EvaluatePhase3Response,
  ApiDataEnvelope,
  CollocationVariationsResponse,
  Phase1TranslationApiResponse,
} from "../types";

function interceptedResponseBody<T>(
  request: Promise<AxiosResponse<T>>,
): Promise<T> {
  // axiosClient's response interceptor resolves with response.data, not AxiosResponse.
  return request.then((response) => {
    const body: unknown = response;
    return body as T;
  });
}

export const collocationApi = {
  getGlobalList: (params?: GlobalCollocationsQueryParams) =>
    interceptedResponseBody(axiosClient.get<GlobalCollocationsResponse>(
      ENDPOINTS.COLLOCATION.GLOBAL_LIST,
      {
        params,
      },
    )),

  save: (selectedCollocations: Array<{ id: string }>) =>
    interceptedResponseBody(
      axiosClient.post<{ success: boolean }>(ENDPOINTS.COLLOCATION.SAVE, {
        selectedCollocations,
      }),
    ),

  download: (
    selectedCollocations: Array<{ id: string; base_sentence?: string }>,
  ) =>
    interceptedResponseBody(
      axiosClient.post<{ success: boolean; savedCount?: number }>(
        ENDPOINTS.COLLOCATION.DOWNLOAD,
        { selectedCollocations },
      ),
    ),

  adminImport: (collocationsList: CollocationImportItem[]) =>
    interceptedResponseBody(
      axiosClient.post<{ success: boolean }>(
        ENDPOINTS.COLLOCATION.ADMIN_IMPORT,
        { collocationsList },
      ),
    ),

  getUserList: () =>
    interceptedResponseBody(
      axiosClient.get<UserCollocationListResponse>(
        ENDPOINTS.COLLOCATION.USER_LIST,
      ),
    ),

  getDueCards: () =>
    interceptedResponseBody(
      axiosClient.get<UserCollocationListResponse>(
        ENDPOINTS.COLLOCATION.DUE_CARDS,
      ),
    ),

  review: (payload: ReviewRequestPayload) =>
    interceptedResponseBody(
      axiosClient.post<{ success: boolean }>(
        ENDPOINTS.COLLOCATION.REVIEW,
        payload,
      ),
    ),

  getNextCollocation: () =>
    interceptedResponseBody(
      axiosClient.get<NextCollocationItem | null>(
        ENDPOINTS.COLLOCATION.NEXT_REVIEW,
      ),
    ),

  getReview: (collocationId: string) =>
    interceptedResponseBody(
      axiosClient.get<CollocationReviewData>(
        ENDPOINTS.COLLOCATION.GET_REVIEW(collocationId),
      ),
    ),

  getVariations: (collocationId: string) =>
    interceptedResponseBody(
      axiosClient.get<ApiDataEnvelope<CollocationVariationsResponse>>(
        ENDPOINTS.COLLOCATION.GET_VARIATIONS(collocationId),
      ),
    ),

  // --- API MỚI CHO LUỒNG HỌC MỚI ---

  // Phase 1: Lấy thông tin câu dịch tiếng Việt + gợi ý từ vựng
  getPhase1Translation: (collocationId: string) =>
    interceptedResponseBody(
      axiosClient.get<ApiDataEnvelope<Phase1TranslationApiResponse>>(
        ENDPOINTS.COLLOCATION.GET_PHASE1(collocationId),
      ),
    ),

  // Phase 2: AI Chấm câu User tự đặt + Trả về result state ("Not completed" | "Good" | "Excellent") + Existed Answers
  evaluatePhase2: (payload: EvaluatePhase2Payload) =>
    interceptedResponseBody(
      axiosClient.post<ApiDataEnvelope<EvaluatePhase2Response>>(
        ENDPOINTS.COLLOCATION.EVALUATE_PHASE2,
        payload,
      ),
    ),

  // Phase 3: AI Chấm đoạn văn ngắn / bài dịch mẩu chuyện
  evaluatePhase3: (payload: EvaluatePhase3Payload) =>
    interceptedResponseBody(
      axiosClient.post<ApiDataEnvelope<EvaluatePhase3Response>>(
        ENDPOINTS.COLLOCATION.EVALUATE_PHASE3,
        payload,
      ),
    ),

  // Hoàn tất bài học
  completeReview: (collocationId: string, rating: "good" | "easy") =>
    interceptedResponseBody(
      axiosClient.post<ApiDataEnvelope<unknown>>(
        ENDPOINTS.COLLOCATION.COMPLETE_REVIEW(collocationId),
        { rating },
      ),
    ),
};
