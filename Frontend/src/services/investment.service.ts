import apiClient from "@/api/axios";
import {API_ENDPOINTS} from "@/api/endpoints";
import type {ApiResponse, PaginatedResponse, ApiListParams} from "@/api/types";
import type {Investment, InvestmentFormData} from "@/types/investment.types";

export const getInvestments = async (params?: ApiListParams) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Investment>>>(API_ENDPOINTS.INVESTMENTS.LIST, {params});
  return response;
};

export const getInvestment = async (id: string) => {
  const response = await apiClient.get<ApiResponse<Investment>>(API_ENDPOINTS.INVESTMENTS.DETAIL(id));
  return response;
};

export const createInvestment = async (data: InvestmentFormData) => {
  const response = await apiClient.post<ApiResponse<Investment>>(API_ENDPOINTS.INVESTMENTS.CREATE, data);
  return response;
};

export const updateInvestment = async (id: string, data: Partial<InvestmentFormData>) => {
  const response = await apiClient.put<ApiResponse<Investment>>(API_ENDPOINTS.INVESTMENTS.UPDATE(id), data);
  return response;
};

export const deleteInvestment = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.INVESTMENTS.DELETE(id));
  return response;
};

export const exportInvestment = async (id: string, format: "csv" | "json") => {
  const response = await apiClient.get(`${API_ENDPOINTS.INVESTMENTS.EXPORT(id)}?format=${format}`, {responseType: "blob"});
  return response;
};
