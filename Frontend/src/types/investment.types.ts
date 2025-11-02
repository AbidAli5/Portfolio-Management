export type InvestmentType = "stock" | "bond" | "mutual_fund" | "etf" | "crypto" | "real_estate" | "commodity" | "other";

export type InvestmentStatus = "active" | "sold" | "closed" | "pending";

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  amount: number;
  currentValue: number;
  purchaseDate: string;
  status: InvestmentStatus;
  description?: string;
  symbol?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentFormData {
  name: string;
  type: InvestmentType;
  amount: number;
  currentValue: number;
  purchaseDate: string;
  status: InvestmentStatus;
  description?: string;
  symbol?: string;
}

export interface InvestmentPerformance {
  investmentId: string;
  investmentName: string;
  initialValue: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}
