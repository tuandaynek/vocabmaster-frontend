import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import type { LoginPayload, RegisterPayload, AuthResponse, User } from "../types";

export const authApi = {
  login: (data: LoginPayload): Promise<AuthResponse> => {
    return axiosClient.post(ENDPOINTS.AUTH.LOGIN, data);
  },

  register: (data: RegisterPayload): Promise<AuthResponse> => {
    return axiosClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  getMe: (): Promise<User> => {
    return axiosClient.get(ENDPOINTS.AUTH.ME);
  },
  logout: (): Promise<void> => {
    return axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
  }
};