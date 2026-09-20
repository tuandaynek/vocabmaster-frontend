import axios from 'axios';

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

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/signin';
    }
    return Promise.reject(error.response || { message: error.message || 'Lỗi kết nối Server' });
  }
);

export default axiosClient;
