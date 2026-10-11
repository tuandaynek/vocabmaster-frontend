import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { UserProfileResponse } from "@/features/profile/types";

export const profileApi = {
  getProfile: (): Promise<UserProfileResponse> => {
    return axiosClient.get(ENDPOINTS.PROFILE.GET) as unknown as Promise<UserProfileResponse>;
  }
};
