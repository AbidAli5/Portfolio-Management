import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Modal from '@/components/common/Modal';
import { useState } from 'react';
import * as investmentService from '@/services/investment.service';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import Table from '@/components/common/Table';
import PerformanceChart from '@/components/charts/PerformanceChart';
import * as transactionService from '@/services/transaction.service';

export default function InvestmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: investment, isLoading } = useQuery({
    queryKey: ['investment', id],
    queryFn: () => investmentService.getInvestment(id!),
  });

  const { data: transactions } = useQuery({
    queryKey: ['investment-transactions', id],
    queryFn: () => transactionService.getTransactions({ investmentId: id }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => investmentService.deleteInvestment(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast.success('Investment deleted successfully');
      navigate(ROUTES.INVESTMENTS);
    },
    onError: () => {
      toast.error('Failed to delete investment');
    },
  });

  const exportMutation = useMutation({
    mutationFn: (format: 'csv' | 'json') => investmentService.exportInvestment(id!, format),
    onSuccess: (data, format) => {
      const blob = new Blob([data.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investment-${id}-${new Date().toISOString()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Investment exported successfully');
    },
    onError: () => {
      toast.error('Failed to export investment');
    },
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!investment?.data.data) {
    return <div>Investment not found</div>;
  }

  const inv = investment.data.data;
  const gainLoss = inv.currentValue - inv.amount;
  const gainLossPercent = (gainLoss / inv.amount) * 100;

  // Mock performance data - in real app, fetch from API
  const performanceData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
    value: inv.currentValue + (Math.random() - 0.5) * 10000,
  }));

  const transactionList = transactions?.data.data.data || [];
  const transactionColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (t: any) => formatDate(t.date),
    },
    {
      key: 'type',
      header: 'Type',
      render: (t: any) => t.type,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (t: any) => t.quantity,
    },
    {
      key: 'price',
      header: 'Price',
      render: (t: any) => formatCurrency(t.price),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (t: any) => formatCurrency(t.amount),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{inv.name}</h1>
          <p className="text-gray-600 mt-1">{inv.type} • {inv.symbol || 'N/A'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.INVESTMENT_EDIT(id!)}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate('csv')}
            loading={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">Initial Amount</dt>
              <dd className="text-lg font-semibold text-gray-900">{formatCurrency(inv.amount)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Current Value</dt>
              <dd className="text-lg font-semibold text-gray-900">{formatCurrency(inv.currentValue)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Gain/Loss</dt>
              <dd className={`text-lg font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(gainLoss)} ({formatPercentage(gainLossPercent)})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Purchase Date</dt>
              <dd className="text-lg text-gray-900">{formatDate(inv.purchaseDate)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Status</dt>
              <dd>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    inv.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {inv.status}
                </span>
              </dd>
            </div>
            {inv.description && (
              <div>
                <dt className="text-sm font-medium text-gray-600">Description</dt>
                <dd className="text-gray-900">{inv.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
          <PerformanceChart data={performanceData} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="p-6">
          <Table
            data={transactionList}
            columns={transactionColumns}
            emptyMessage="No transactions found"
          />
        </div>
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
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{inv.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

