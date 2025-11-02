import apiClient from "@/api/axios";
import {API_ENDPOINTS} from "@/api/endpoints";
import type {ApiResponse} from "@/api/types";

export interface PerformanceData {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  period: string;
}

export interface DistributionData {
  type: string;
  value: number;
  percentage: number;
}

export interface TrendData {
  month: string;
  value: number;
}

export interface TopPerformer {
  investmentId: string;
  investmentName: string;
  gainLossPercent: number;
  currentValue: number;
}

export const getPerformanceSummary = async (period: "monthly" | "yearly" = "monthly") => {
  const response = await apiClient.get<ApiResponse<PerformanceData>>(API_ENDPOINTS.REPORTS.PERFORMANCE, {params: {period}});
  return response;
};

export const getDistribution = async () => {
  const response = await apiClient.get<ApiResponse<DistributionData[]>>(API_ENDPOINTS.REPORTS.DISTRIBUTION);
  return response;
};

export const getTrends = async () => {
  const response = await apiClient.get<ApiResponse<TrendData[]>>(API_ENDPOINTS.REPORTS.TRENDS);
  return response;
};

export const getTopPerformers = async (limit: number = 5) => {
  const response = await apiClient.get<ApiResponse<TopPerformer[]>>(API_ENDPOINTS.REPORTS.TOP_PERFORMERS, {params: {limit}});
  return response;
};

export const getYearOverYear = async () => {
  const response = await apiClient.get<ApiResponse<{current: number; previous: number; change: number}>>(API_ENDPOINTS.REPORTS.YOY_COMPARISON);
  return response;
};

export const exportReports = async (format: "pdf" | "csv" | "json") => {
  const response = await apiClient.get(`${API_ENDPOINTS.REPORTS.EXPORT}?format=${format}`, {responseType: "blob"});
  return response;
};
