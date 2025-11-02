import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import * as reportService from '@/services/report.service';
import { formatCurrency, formatPercentage, formatDate } from '@/utils/formatters';
import PerformanceChart from '@/components/charts/PerformanceChart';
import AssetAllocationChart from '@/components/charts/AssetAllocationChart';
import TrendChart from '@/components/charts/TrendChart';
import Table from '@/components/common/Table';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';

export default function Reports() {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['performance-summary', period],
    queryFn: () => reportService.getPerformanceSummary(period),
  });

  const { data: distribution } = useQuery({
    queryKey: ['distribution'],
    queryFn: () => reportService.getDistribution(),
  });

  const { data: trends } = useQuery({
    queryKey: ['trends'],
    queryFn: () => reportService.getTrends(),
  });

  const { data: topPerformers } = useQuery({
    queryKey: ['top-performers'],
    queryFn: () => reportService.getTopPerformers(10),
  });

  const { data: yoy } = useQuery({
    queryKey: ['yoy'],
    queryFn: () => reportService.getYearOverYear(),
  });

  const exportMutation = useMutation({
    mutationFn: (format: 'pdf' | 'csv' | 'json') => reportService.exportReports(format),
    onSuccess: (data, format) => {
      const blob = new Blob([data.data], {
        type: format === 'csv' ? 'text/csv' : format === 'json' ? 'application/json' : 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${new Date().toISOString()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Reports exported successfully');
    },
    onError: () => {
      toast.error('Failed to export reports');
    },
  });

  const isLoading = perfLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const perfData = performance?.data.data;
  const allocationData = distribution?.data.data?.map((item) => ({
    name: item.type,
    value: item.value,
    percentage: item.percentage,
  })) || [];

  const trendData = trends?.data.data?.map((item) => ({
    month: item.month,
    value: item.value,
  })) || [];

  const topPerformersData = topPerformers?.data.data || [];
  const topPerformersColumns = [
    {
      key: 'investmentName',
      header: 'Investment',
    },
    {
      key: 'currentValue',
      header: 'Current Value',
      render: (item: any) => formatCurrency(item.currentValue),
    },
    {
      key: 'gainLossPercent',
      header: 'Performance',
      render: (item: any) => (
        <span className={item.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatPercentage(item.gainLossPercent)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate('csv')}
            loading={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate('json')}
            loading={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {perfData ? formatCurrency(perfData.totalValue) : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              perfData && perfData.totalGain >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {perfData ? formatCurrency(perfData.totalGain) : 'N/A'}
          </p>
          {perfData && (
            <p className="text-sm text-gray-600 mt-1">{formatPercentage(perfData.totalGainPercent)}</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">ROI</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {perfData ? formatPercentage(perfData.totalGainPercent) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
          <TrendChart data={trendData} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Distribution</h2>
          <AssetAllocationChart data={allocationData} />
        </div>
      </div>

      {/* Year-over-Year */}
      {yoy?.data.data && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Year-over-Year Comparison</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Current Year</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(yoy.data.data.current)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Previous Year</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(yoy.data.data.previous)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Change</p>
              <p
                className={`text-xl font-bold ${
                  yoy.data.data.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatPercentage(yoy.data.data.change)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Investments</h2>
        </div>
        <div className="p-6">
          <Table
            data={topPerformersData}
            columns={topPerformersColumns}
            emptyMessage="No data available"
          />
        </div>
      </div>
    </div>
  );
}

