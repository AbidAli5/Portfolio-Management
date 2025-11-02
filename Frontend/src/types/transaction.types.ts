export type TransactionType = "buy" | "sell" | "dividend" | "interest" | "fee" | "transfer";

export type TransactionStatus = "pending" | "completed" | "cancelled" | "failed";

export interface Transaction {
  id: string;
  investmentId: string;
  investmentName?: string;
  type: TransactionType;
  quantity: number;
  price: number;
  amount: number;
  fees?: number;
  date: string;
  status: TransactionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  investmentId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees?: number;
  date: string;
  status: TransactionStatus;
  notes?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  investmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
