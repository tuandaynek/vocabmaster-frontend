import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";

export const websiteApi = {
    pushRating: async (feature_name: string, rating: number, comment: string) => {
        const response = await axiosClient.post(ENDPOINTS.WEBSITE.SUBMIT_RATING, { feature_name, rating, comment });
        return response.data;
    },

    getStatsPublic: async () => {
        const response = await axiosClient.get(ENDPOINTS.WEBSITE.STATS_PUBLIC);
        return response.data;
    },

    getRatedFeatures: async () => {
        const response = await axiosClient.get(ENDPOINTS.WEBSITE.GET_MY_RATING);
        return response.data;
    }
}