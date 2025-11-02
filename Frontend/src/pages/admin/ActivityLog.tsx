import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Loading from "@/components/common/Loading";
import * as adminService from "@/services/admin.service";
import type {ActivityLog as ActivityLogType} from "@/types/user.types";
import {useDebounce} from "@/hooks/useDebounce";
import {formatDate} from "@/utils/formatters";

export default function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const {data, isLoading} = useQuery({
    queryKey: ["activity-log", page, debouncedSearch],
    queryFn: () => adminService.getActivityLog({page, limit: 20, search: debouncedSearch}),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const activities = data?.data.data.data || [];
  const columns = [
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (activity: ActivityLogType) => formatDate(activity.createdAt, "long"),
    },
    {
      key: "userEmail",
      header: "User",
      render: (activity: ActivityLogType) => activity.userEmail || "System",
    },
    {
      key: "action",
      header: "Action",
      render: (activity: ActivityLogType) => <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{activity.action}</span>,
    },
    {
      key: "entityType",
      header: "Entity",
      render: (activity: ActivityLogType) => activity.entityType,
    },
    {
      key: "details",
      header: "Details",
      render: (activity: ActivityLogType) => activity.details || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <Input type="text" placeholder="Search activities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
        </div>

        <Table data={activities} columns={columns} emptyMessage="No activity found" />

        {/* Pagination */}
        {data && data.data.data.total > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.data.data.total)} of {data.data.data.total} activities
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
