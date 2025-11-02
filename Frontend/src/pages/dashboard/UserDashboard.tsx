import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {TrendingUp, TrendingDown, Wallet, Activity} from "lucide-react";
import {formatCurrency, formatPercentage, formatDate} from "@/utils/formatters";
import PerformanceChart from "@/components/charts/PerformanceChart";
import AssetAllocationChart from "@/components/charts/AssetAllocationChart";
import Loading from "@/components/common/Loading";
import * as reportService from "@/services/report.service";
import * as transactionService from "@/services/transaction.service";

export default function UserDashboard() {
  const {data: performance, isLoading: perfLoading} = useQuery({
    queryKey: ["performance-summary"],
    queryFn: () => reportService.getPerformanceSummary("monthly"),
  });

  const {data: distribution, isLoading: distLoading} = useQuery({
    queryKey: ["distribution"],
    queryFn: () => reportService.getDistribution(),
  });

  const {data: trends, isLoading: trendsLoading} = useQuery({
    queryKey: ["trends"],
    queryFn: () => reportService.getTrends(),
  });

  const {data: transactions, isLoading: transLoading} = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => transactionService.getTransactions({page: 1, limit: 10}),
  });

  const isLoading = perfLoading || distLoading || trendsLoading || transLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const portfolioValue = performance?.data.data.totalValue || 0;
  const gainLoss = performance?.data.data.totalGain || 0;
  const gainLossPercent = performance?.data.data.totalGainPercent || 0;
  const activeInvestments = distribution?.data.data?.reduce((sum: number, item: {value: number}) => sum + item.value, 0) || 0;

  // Transform trends data for chart
  const chartData =
    trends?.data.data?.map((item: {month: string; value: number}) => ({
      month: item.month,
      value: item.value,
    })) || [];

  // Transform distribution data for chart
  const allocationData =
    distribution?.data.data?.map((item: {type: string; value: number; percentage: number}) => ({
      name: item.type,
      value: item.value,
      percentage: item.percentage,
    })) || [];

  const recentTransactions = transactions?.data.data.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(portfolioValue)}</p>
            </div>
            <Wallet className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gain/Loss</p>
              <p className={`text-2xl font-bold mt-1 ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>{formatPercentage(gainLossPercent)}</p>
              <p className={`text-sm mt-1 ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(gainLoss)}</p>
            </div>
            {gainLoss >= 0 ? <TrendingUp className="w-10 h-10 text-green-600" /> : <TrendingDown className="w-10 h-10 text-red-600" />}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeInvestments}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Performer</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Loading...</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">12-Month Performance</h2>
          <PerformanceChart data={chartData} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h2>
          <AssetAllocationChart data={allocationData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.slice(0, 5).map((transaction: {id: string; date: string; type: string; investmentName?: string; amount: number; status: string}) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.investmentName || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.status === "completed" ? "bg-green-100 text-green-800" : transaction.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{transaction.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
