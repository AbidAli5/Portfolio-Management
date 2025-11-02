import {useState} from "react";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {Plus, Edit, Trash2, Search} from "lucide-react";
import {toast} from "react-toastify";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Table from "@/components/common/Table";
import Loading from "@/components/common/Loading";
import Modal from "@/components/common/Modal";
import * as investmentService from "@/services/investment.service";
import type {Investment} from "@/types/investment.types";
import {useDebounce} from "@/hooks/useDebounce";
import {formatCurrency, formatDate} from "@/utils/formatters";
import {INVESTMENT_TYPES, INVESTMENT_STATUS, ROUTES} from "@/utils/constants";

export default function InvestmentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  const {data, isLoading} = useQuery({
    queryKey: ["investments", page, debouncedSearch, statusFilter, typeFilter, sortKey, sortOrder],
    queryFn: () =>
      investmentService.getInvestments({
        page,
        limit: 10,
        search: debouncedSearch,
        sortBy: sortKey,
        sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => investmentService.deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["investments"]});
      toast.success("Investment deleted successfully");
      setIsDeleteModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete investment");
    },
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedInvestment) {
      deleteMutation.mutate(selectedInvestment.id);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const investments = data?.data.data.data || [];
  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (investment: Investment) => (
        <Link to={ROUTES.INVESTMENT_DETAIL(investment.id)} className="text-primary-600 hover:text-primary-700 font-medium">
          {investment.name}
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (investment: Investment) => investment.type,
    },
    {
      key: "amount",
      header: "Initial Amount",
      sortable: true,
      render: (investment: Investment) => formatCurrency(investment.amount),
    },
    {
      key: "currentValue",
      header: "Current Value",
      sortable: true,
      render: (investment: Investment) => formatCurrency(investment.currentValue),
    },
    {
      key: "status",
      header: "Status",
      render: (investment: Investment) => <span className={`px-2 py-1 text-xs font-medium rounded-full ${investment.status === "active" ? "bg-green-100 text-green-800" : investment.status === "sold" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{investment.status}</span>,
    },
    {
      key: "purchaseDate",
      header: "Purchase Date",
      sortable: true,
      render: (investment: Investment) => formatDate(investment.purchaseDate),
    },
    {
      key: "actions",
      header: "Actions",
      render: (investment: Investment) => (
        <div className="flex items-center gap-2">
          <Link to={ROUTES.INVESTMENT_EDIT(investment.id)} className="p-1 text-gray-600 hover:text-primary-600" title="Edit">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => handleDelete(investment)} className="p-1 text-red-600 hover:text-red-700" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
        <Link to={ROUTES.INVESTMENT_FORM}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="text" label="Search investments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select label="Filter by type" options={[{value: "", label: "All Types"}, ...INVESTMENT_TYPES]} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
            <Select label="Filter by status" options={[{value: "", label: "All Statuses"}, ...INVESTMENT_STATUS]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          </div>
        </div>

        <Table data={investments} columns={columns} onSort={handleSort} sortKey={sortKey} sortOrder={sortOrder} emptyMessage="No investments found" />

        {/* Pagination */}
        {data && data.data.data.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.data.data.total)} of {data.data.data.total} investments
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          </>
        }>
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{selectedInvestment?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
