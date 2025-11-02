export const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stock' },
  { value: 'bond', label: 'Bond' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'etf', label: 'ETF' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'other', label: 'Other' },
] as const;

export const INVESTMENT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending', label: 'Pending' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' },
  { value: 'dividend', label: 'Dividend' },
  { value: 'interest', label: 'Interest' },
  { value: 'fee', label: 'Fee' },
  { value: 'transfer', label: 'Transfer' },
] as const;

export const TRANSACTION_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
] as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  INVESTMENTS: '/investments',
  INVESTMENT_DETAIL: (id: string) => `/investments/${id}`,
  INVESTMENT_FORM: '/investments/new',
  INVESTMENT_EDIT: (id: string) => `/investments/${id}/edit`,
  TRANSACTIONS: '/transactions',
  TRANSACTION_FORM: '/transactions/new',
  REPORTS: '/reports',
  PROFILE: '/profile',
  ADMIN_USERS: '/admin/users',
  ADMIN_ACTIVITY: '/admin/activity',
} as const;

