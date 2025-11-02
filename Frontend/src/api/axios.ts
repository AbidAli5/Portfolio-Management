import axios, {AxiosError} from "axios";
import type {InternalAxiosRequestConfig} from "axios";
import {toast} from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {refreshToken});

          const {token} = response.data.data;
          localStorage.setItem("token", token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - logout user
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Handle other errors
    if (error.response) {
      const message = (error.response.data as any)?.message || "An error occurred";

      // Don't show toast for 401 (already handled) or 403 (authorization error)
      if (error.response.status !== 401 && error.response.status !== 403) {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
