import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateToken: (token: string) => void;
  updateUser: (user: User) => void; // Hàm mới để cập nhật user thông tin mới từ getMe()
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Gọi khi Đăng nhập thành công lần đầu
      setAuth: (user, token) => {
        localStorage.setItem("accessToken", token);
        set({ user, token, isAuthenticated: true });
      },

      // Gọi khi Axios Interceptor Silent Refresh Token thành công
      updateToken: (token) => {
        localStorage.setItem("accessToken", token);
        set({ token });
      },

      // Gọi khi getMe() lấy thông tin user mới nhất thành công
      updateUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      // 🔥 FIX: Lưu cả user LẪN isAuthenticated để F5 không bị văng
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);