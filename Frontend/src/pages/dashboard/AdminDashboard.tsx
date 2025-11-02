import {useQuery} from "@tanstack/react-query";
import {Users, Wallet, TrendingUp, Activity} from "lucide-react";
import {formatCurrency} from "@/utils/formatters";
import * as adminService from "@/services/admin.service";
import Loading from "@/components/common/Loading";
import {Link} from "react-router-dom";
import {ROUTES} from "@/utils/constants";

export default function AdminDashboard() {
  const {data: stats, isLoading: statsLoading} = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getSystemStats(),
  });

  if (statsLoading) {
    return <Loading fullScreen />;
  }

  const rawData = stats?.data?.data as any;

  const systemStats = rawData
    ? {
        totalUsers: rawData.totalUsers ?? rawData.TotalUsers ?? 0,
        totalPortfolios: rawData.totalInvestments ?? rawData.TotalInvestments ?? 0,
        totalInvestmentValue: rawData.totalInvestmentValue ?? rawData.TotalInvestmentValue ?? 0,
        activeTransactions: rawData.activeTransactions ?? rawData.ActiveTransactions ?? 0,
      }
    : {
        totalUsers: 0,
        totalPortfolios: 0,
        totalInvestmentValue: 0,
        activeTransactions: 0,
      };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalUsers}</p>
            </div>
            <Users className="w-10 h-10 text-primary-600" />
          </div>
          <Link to={ROUTES.ADMIN_USERS} className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium inline-block">
            View all users →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolios</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalPortfolios}</p>
            </div>
            <Wallet className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investment Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(systemStats.totalInvestmentValue)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.activeTransactions}</p>
            </div>
            <Activity className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to={ROUTES.ADMIN_USERS} className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600 mt-1">View and manage user accounts</p>
            </Link>
            <Link to={ROUTES.ADMIN_ACTIVITY} className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Activity Log</h3>
              <p className="text-sm text-gray-600 mt-1">View system activity and audit trail</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
