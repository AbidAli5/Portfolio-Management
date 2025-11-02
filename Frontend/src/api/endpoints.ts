const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    PROFILE: `${API_BASE}/auth/profile`,
    UPDATE_PROFILE: `${API_BASE}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
  },

  // Investments
  INVESTMENTS: {
    LIST: `${API_BASE}/investments`,
    CREATE: `${API_BASE}/investments`,
    DETAIL: (id: string) => `${API_BASE}/investments/${id}`,
    UPDATE: (id: string) => `${API_BASE}/investments/${id}`,
    DELETE: (id: string) => `${API_BASE}/investments/${id}`,
    EXPORT: (id: string) => `${API_BASE}/investments/${id}/export`,
  },

  // Transactions
  TRANSACTIONS: {
    LIST: `${API_BASE}/transactions`,
    CREATE: `${API_BASE}/transactions`,
    DETAIL: (id: string) => `${API_BASE}/transactions/${id}`,
    UPDATE: (id: string) => `${API_BASE}/transactions/${id}`,
    DELETE: (id: string) => `${API_BASE}/transactions/${id}`,
  },

  // Reports
  REPORTS: {
    PERFORMANCE: `${API_BASE}/reports/performance`,
    DISTRIBUTION: `${API_BASE}/reports/distribution`,
    TRANSACTIONS: `${API_BASE}/reports/transactions`,
    TRENDS: `${API_BASE}/reports/trends`,
    TOP_PERFORMERS: `${API_BASE}/reports/top-performers`,
    YOY_COMPARISON: `${API_BASE}/reports/year-over-year`,
    EXPORT: `${API_BASE}/reports/export`,
  },

  // Admin
  ADMIN: {
    USERS: `${API_BASE}/admin/users`,
    USER_CREATE: `${API_BASE}/admin/users`,
    USER_DETAIL: (id: string) => `${API_BASE}/admin/users/${id}`,
    USER_UPDATE: (id: string) => `${API_BASE}/admin/users/${id}`,
    USER_DELETE: (id: string) => `${API_BASE}/admin/users/${id}`,
    USER_ACTIVATE: (id: string) => `${API_BASE}/admin/users/${id}/activate`,
    STATS: `${API_BASE}/admin/stats`,
    ACTIVITY_LOG: `${API_BASE}/admin/activity-log`,
  },
};
