import apiClient from "@/api/axios";
import {API_ENDPOINTS} from "@/api/endpoints";
import type {ApiResponse, PaginatedResponse, ApiListParams} from "@/api/types";
import type {Transaction, TransactionFormData, TransactionFilters} from "@/types/transaction.types";

export const getTransactions = async (params?: ApiListParams & TransactionFilters) => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(API_ENDPOINTS.TRANSACTIONS.LIST, {params});
  return response;
};

export const getTransaction = async (id: string) => {
  const response = await apiClient.get<ApiResponse<Transaction>>(API_ENDPOINTS.TRANSACTIONS.DETAIL(id));
  return response;
};

export const createTransaction = async (data: TransactionFormData) => {
  const response = await apiClient.post<ApiResponse<Transaction>>(API_ENDPOINTS.TRANSACTIONS.CREATE, data);
  return response;
};

export const updateTransaction = async (id: string, data: Partial<TransactionFormData>) => {
  const response = await apiClient.put<ApiResponse<Transaction>>(API_ENDPOINTS.TRANSACTIONS.UPDATE(id), data);
  return response;
};

export const deleteTransaction = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.TRANSACTIONS.DELETE(id));
  return response;
};
