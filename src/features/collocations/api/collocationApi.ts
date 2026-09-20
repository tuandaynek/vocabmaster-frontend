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
  completePhase3: (collocationId: string, rating: "good" | "easy") =>
    axiosClient.post(
      ENDPOINTS.COLLOCATION.COMPLETE_PHASE3(collocationId),
      { rating }
    )
};
