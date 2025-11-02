import type {User} from "./auth.types";

export interface AdminUser extends User {
  lastLogin?: string;
  portfoliosCount?: number;
  totalInvestments?: number;
}

export type UserStatus = "active" | "inactive" | "suspended";

export interface UserFilters {
  search?: string;
  role?: "admin" | "user";
  status?: UserStatus;
  emailVerified?: boolean;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}
