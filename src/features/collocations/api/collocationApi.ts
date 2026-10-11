import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  CollocationReviewData,
  GlobalCollocationItem,
  GlobalCollocationsQueryParams,
  GlobalCollocationsResponse,
  NextCollocationItem,
  ReviewRequestPayload,
  UserCollocationListResponse,
  Phase1DataResponse,
  EvaluatePhase2Payload,
  EvaluatePhase2Response,
  EvaluatePhase3Payload,
  EvaluatePhase3Response,
} from "../types";

export const collocationApi = {
  getGlobalList: (params?: GlobalCollocationsQueryParams) =>
    axiosClient.get<GlobalCollocationsResponse>(
      ENDPOINTS.COLLOCATION.GLOBAL_LIST,
      {
        params,
      },
    ) as unknown as Promise<GlobalCollocationsResponse>,

  save: (selectedCollocations: Array<{ id: string }>) =>
    axiosClient.post(ENDPOINTS.COLLOCATION.SAVE, { selectedCollocations }),

  download: (
    selectedCollocations: Array<{ id: string; base_sentence?: string }>,
  ) =>
    axiosClient.post(ENDPOINTS.COLLOCATION.DOWNLOAD, { selectedCollocations }),

  adminImport: (collocationsList: GlobalCollocationItem[]) =>
    axiosClient.post(ENDPOINTS.COLLOCATION.ADMIN_IMPORT, { collocationsList }),

  getUserList: () =>
    axiosClient.get<UserCollocationListResponse>(
      ENDPOINTS.COLLOCATION.USER_LIST,
    ) as unknown as Promise<UserCollocationListResponse>,

  getDueCards: () =>
    axiosClient.get<UserCollocationListResponse>(
      ENDPOINTS.COLLOCATION.DUE_CARDS,
    ) as unknown as Promise<UserCollocationListResponse>,

  review: (payload: ReviewRequestPayload) =>
    axiosClient.post(
      ENDPOINTS.COLLOCATION.REVIEW,
      payload,
    ) as unknown as Promise<{
      success: boolean;
    }>,

  getNextCollocation: () =>
    axiosClient.get<NextCollocationItem | null>(
      ENDPOINTS.COLLOCATION.NEXT_REVIEW,
    ) as unknown as Promise<NextCollocationItem | null>,

  getReview: (collocationId: string) =>
    axiosClient.get<CollocationReviewData>(
      ENDPOINTS.COLLOCATION.GET_REVIEW(collocationId),
    ) as unknown as Promise<CollocationReviewData>,

  getVariations: (collocationId: string) =>
    axiosClient.get<CollocationReviewData>(
      ENDPOINTS.COLLOCATION.GET_VARIATIONS(collocationId),
    ) as unknown as Promise<CollocationReviewData>,

  // --- API MỚI CHO LUỒNG HỌC MỚI ---

  // Phase 1: Lấy thông tin câu dịch tiếng Việt + gợi ý từ vựng
  getPhase1Translation: (collocationId: string) =>
    axiosClient.get<Phase1DataResponse>(
      ENDPOINTS.COLLOCATION.GET_PHASE1(collocationId),
    ) as unknown as Promise<Phase1DataResponse>,

  // Phase 2: AI Chấm câu User tự đặt + Trả về result state ("Not completed" | "Good" | "Excellent") + Existed Answers
  evaluatePhase2: (payload: EvaluatePhase2Payload) =>
    axiosClient.post<EvaluatePhase2Response>(
      ENDPOINTS.COLLOCATION.EVALUATE_PHASE2,
      payload,
    ) as unknown as Promise<EvaluatePhase2Response>,

  // Phase 3: AI Chấm đoạn văn ngắn / bài dịch mẩu chuyện
  evaluatePhase3: (payload: EvaluatePhase3Payload) =>
    axiosClient.post<EvaluatePhase3Response>(
      ENDPOINTS.COLLOCATION.EVALUATE_PHASE3,
      payload,
    ) as unknown as Promise<EvaluatePhase3Response>,

  // Hoàn tất bài học
  completeReview: (collocationId: string, rating: "good" | "easy") =>
    axiosClient.post(ENDPOINTS.COLLOCATION.COMPLETE_REVIEW(collocationId), { rating }),
};
