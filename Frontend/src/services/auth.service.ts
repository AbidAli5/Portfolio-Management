import apiClient from "@/api/axios";
import {API_ENDPOINTS} from "@/api/endpoints";
import type {ApiResponse} from "@/api/types";
import {type LoginCredentials, type RegisterData, type AuthResponse, type PasswordResetRequest, type PasswordResetConfirm, type ProfileUpdate, type ChangePassword, type User} from "@/types/auth.types";

export const login = async (credentials: LoginCredentials) => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response;
};

export const register = async (data: RegisterData) => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data);
  return response;
};

export const logout = async () => {
  await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
};

export const forgotPassword = async (data: PasswordResetRequest) => {
  const response = await apiClient.post<ApiResponse<{message: string}>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  return response;
};

export const resetPassword = async (data: PasswordResetConfirm) => {
  const response = await apiClient.post<ApiResponse<{message: string}>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  return response;
};

export const getProfile = async () => {
  const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.PROFILE);
  return response;
};

export const updateProfile = async (data: ProfileUpdate) => {
  const response = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
  return response;
};

export const changePassword = async (data: ChangePassword) => {
  const response = await apiClient.post<ApiResponse<{message: string}>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  return response;
};
