import apiClient from "@/api/axios";
import {API_ENDPOINTS} from "@/api/endpoints";
import type {ApiResponse, PaginatedResponse, ApiListParams} from "@/api/types";
import type {AdminUser, ActivityLog, ActivityLogFilters} from "@/types/user.types";

export interface SystemStats {
  totalUsers: number;
  activeUsers?: number;
  totalInvestments: number;
  totalInvestmentValue: number;
  activeTransactions: number;
}

export const getUsers = async (params?: ApiListParams) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>(API_ENDPOINTS.ADMIN.USERS, {params});
  return response;
};

export const getUser = async (id: string) => {
  const response = await apiClient.get<ApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.USER_DETAIL(id));
  return response;
};

export const createUser = async (data: {email: string; password: string; firstName: string; lastName: string; role: "admin" | "user"; isActive: boolean; emailVerified?: boolean}) => {
  const response = await apiClient.post<ApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.USERS, data);
  return response;
};

export const updateUser = async (id: string, data: Partial<AdminUser & {password?: string}>) => {
  const response = await apiClient.put<ApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.USER_UPDATE(id), data);
  return response;
};

export const deleteUser = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ADMIN.USER_DELETE(id));
  return response;
};

export const activateUser = async (id: string, isActive: boolean) => {
  const response = await apiClient.put<ApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.USER_ACTIVATE(id), {isActive});
  return response;
};

export const getSystemStats = async () => {
  const response = await apiClient.get<ApiResponse<SystemStats>>(API_ENDPOINTS.ADMIN.STATS);
  return response;
};

export const getActivityLog = async (params?: ApiListParams & ActivityLogFilters) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<ActivityLog>>>(API_ENDPOINTS.ADMIN.ACTIVITY_LOG, {params});
  return response;
};
