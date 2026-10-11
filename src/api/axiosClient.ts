import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/stores/authStore';

const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.API_BASE_URL ||
  'https://vocabmaster-backend-smn1.onrender.com/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Tự động gắn Access Token vào Header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Quản lý trạng thái Refresh Token & Hàng đợi Request
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// Hàm xử lý lại các request đang chờ trong hàng đợi
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Xử lý Response và Tự động Silent Refresh khi dính lỗi 401 HOẶC 403
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // 🔥 SỬA TẠI ĐÂY: Bắt cả 401 (Unauthorized) LẪN 403 (Forbidden) do Backend hết hạn Token
    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      
      // Trường hợp chính API refresh-token bị lỗi 401/403 -> Logout ngay lập tức
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        useAuthStore.getState().logout();
        return Promise.reject(
          error.response?.data || { message: 'Phiên đăng nhập đã hết hạn' }
        );
      }

      // Nếu đang trong quá trình refresh token -> Đưa các request tiếp theo vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Đánh dấu request này đã retry
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dùng instance axios độc lập (không qua axiosClient) để gọi refresh token
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Đảm bảo lấy đúng token dù backend bọc dưới response.data.accessToken hay response.data.data.accessToken
        const newAccessToken = response.data?.accessToken || response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('Không nhận được Access Token mới từ Server');
        }

        // 1. Cập nhật Token mới vào Zustand Store & LocalStorage
        useAuthStore.getState().updateToken(newAccessToken);

        // 2. Chạy lại tất cả các request đang bị kẹt trong hàng đợi
        processQueue(null, newAccessToken);

        // 3. Thực thi lại request ban đầu với Token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosClient(originalRequest);

      } catch (refreshError) {
        // Nếu refresh token cũng thất bại (hết hạn 14/30 ngày) -> Đăng xuất hẳn
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(
          error.response?.data || { message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' }
        );
      } finally {
        isRefreshing = false;
      }
    }

    // Trả về lỗi định dạng chuẩn nếu không phải lỗi hết hạn Token hoặc refresh thất bại
    return Promise.reject(
      error.response?.data || error.response || { message: error.message || 'Lỗi kết nối Server' }
    );
  }
);

export default axiosClient;