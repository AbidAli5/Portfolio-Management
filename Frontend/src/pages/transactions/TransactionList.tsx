import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {Plus, Search} from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Table from "@/components/common/Table";
import Loading from "@/components/common/Loading";
import * as transactionService from "@/services/transaction.service";
import type {Transaction, TransactionStatus, TransactionType} from "@/types/transaction.types";
import {useDebounce} from "@/hooks/useDebounce";
import {formatCurrency, formatDate} from "@/utils/formatters";
import {TRANSACTION_TYPES, TRANSACTION_STATUS, ROUTES} from "@/utils/constants";

export default function TransactionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {data, isLoading} = useQuery({
    queryKey: ["transactions", page, debouncedSearch, typeFilter, statusFilter],
    queryFn: () =>
      transactionService.getTransactions({
        page,
        limit: 10,
        search: debouncedSearch,
        type: (typeFilter as TransactionType) || undefined,
        status: (statusFilter as TransactionStatus) || undefined,
      }),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const transactions = data?.data.data.data || [];
  const columns = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (transaction: Transaction) => formatDate(transaction.date),
    },
    {
      key: "type",
      header: "Type",
      render: (transaction: Transaction) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.type === "buy" ? "bg-green-100 text-green-800" : transaction.type === "sell" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{transaction.type}</span>,
    },
    {
      key: "investmentName",
      header: "Investment",
      render: (transaction: Transaction) => transaction.investmentName || "N/A",
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (transaction: Transaction) => transaction.quantity,
    },
    {
      key: "price",
      header: "Price",
      render: (transaction: Transaction) => formatCurrency(transaction.price),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (transaction: Transaction) => formatCurrency(transaction.amount),
    },
    {
      key: "status",
      header: "Status",
      render: (transaction: Transaction) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === "completed" ? "bg-green-100 text-green-800" : transaction.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{transaction.status}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <Link to={ROUTES.TRANSACTION_FORM}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select options={[{value: "", label: "All Types"}, ...TRANSACTION_TYPES]} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
            <Select options={[{value: "", label: "All Statuses"}, ...TRANSACTION_STATUS]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          </div>
        </div>

        <Table data={transactions} columns={columns} emptyMessage="No transactions found" />

        {/* Pagination */}
        {data && data.data.data.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.data.data.total)} of {data.data.data.total} transactions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= data.data.data.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
