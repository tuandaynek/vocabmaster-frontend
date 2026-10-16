import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type {
  PublicWebsiteStats,
  RatingSubmissionResponse,
  WebsiteApiEnvelope,
} from "../types";

// The shared Axios response interceptor returns the body, while the Axios type still describes AxiosResponse.
const getEnvelopeData = <T,>(request: Promise<unknown>): Promise<T> =>
  request.then(
    (response) => (response as unknown as WebsiteApiEnvelope<T>).data,
  );

export const websiteApi = {
  pushRating: async (
    feature_name: string,
    rating: number,
    comment: string,
  ): Promise<void> => {
    await axiosClient.post<RatingSubmissionResponse>(
      ENDPOINTS.WEBSITE.SUBMIT_RATING,
      { feature_name, rating, comment },
    );
  },

  getStatsPublic: (): Promise<PublicWebsiteStats> =>
    getEnvelopeData(
      axiosClient.get<WebsiteApiEnvelope<PublicWebsiteStats>>(
        ENDPOINTS.WEBSITE.STATS_PUBLIC,
      ),
    ),

  getRatedFeatures: (): Promise<string[]> =>
    getEnvelopeData(
      axiosClient.get<WebsiteApiEnvelope<string[]>>(
        ENDPOINTS.WEBSITE.GET_MY_RATING,
      ),
    ),
};